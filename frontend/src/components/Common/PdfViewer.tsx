import React, { useEffect, useRef, useState } from 'react';
import { Spin, Button, Empty } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';

// pdfjs-dist v4 ships an ESM build. We use the legacy build for broader
// browser compatibility (Safari < 17, older Android Chrome) and configure
// the worker via a Vite-friendly URL import.
//
// IMPORTANT: many static-file hosts (incl. nginx defaults) serve .mjs
// files with `Content-Type: application/octet-stream`, which causes
// browsers to refuse to dynamic-`import()` them under "strict MIME
// checking for module scripts". To survive that, we don't hand pdfjs
// the raw URL — instead we fetch the worker source ourselves on first
// use, wrap it in a Blob with the correct `text/javascript` MIME type,
// and feed pdfjs a `blob:` URL it can always load.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

// Set the original URL as a fallback. The Blob-URL replacement below
// runs asynchronously the first time a PDF is opened, replacing this.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

let workerBlobUrlPromise: Promise<string> | null = null;
function getWorkerBlobUrl(): Promise<string> {
    if (!workerBlobUrlPromise) {
        workerBlobUrlPromise = fetch(pdfWorkerUrl)
            .then(r => {
                if (!r.ok) throw new Error(`worker fetch failed: ${r.status}`);
                return r.text();
            })
            .then(code => {
                const blob = new Blob([code], { type: 'text/javascript' });
                return URL.createObjectURL(blob);
            })
            .catch(err => {
                // Reset so we don't cache the failure forever
                workerBlobUrlPromise = null;
                throw err;
            });
    }
    return workerBlobUrlPromise;
}

/**
 * Renders a PDF inline by drawing each page to a <canvas>. Works on every
 * browser including iOS Safari and Android Chrome, which refuse to render
 * PDFs inside <iframe>/<object> tags.
 *
 * - Pages are rendered at the device pixel ratio for sharp text on Retina.
 * - Width hugs the parent container so it always fits — no horizontal
 *   scroll on phones.
 * - Includes simple zoom in/out controls.
 */
interface PdfViewerProps {
    /** Blob URL or HTTPS URL to the PDF. */
    src: string;
    /** Callback when load fails. */
    onError?: (err: Error) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, onError }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [zoom, setZoom] = useState(1);
    // Tracks the loaded document so zoom changes don't re-fetch the file.
    const docRef = useRef<any>(null);
    const renderTaskRefs = useRef<any[]>([]);

    // Load (or reload) the PDF document when src changes.
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setNumPages(0);
        docRef.current = null;

        // Helper that loads the doc once. On the first failure caused by
        // the worker not being fetchable (typical on hosts that serve
        // .mjs with the wrong MIME type), we transparently retry with
        // the worker disabled so the PDF still renders on the main
        // thread — slower but always functional.
        const loadDoc = async (disableWorker: boolean) => {
            // `disableWorker` exists at runtime in pdfjs-dist v4 even though
            // the public type signature doesn't yet expose it — cast through
            // `any` to silence the strict-object-literal check.
            const params: any = {
                url: src,
                isEvalSupported: false,
                disableWorker,
            };
            const loadingTask = pdfjsLib.getDocument(params);
            return loadingTask.promise;
        };

        const load = async () => {
            try {
                // Replace the workerSrc with a Blob-URL version BEFORE the
                // first PDF load. This guarantees the worker is served as
                // `text/javascript` regardless of the static host's MIME
                // configuration. We do this once per session and cache the
                // resulting URL so subsequent loads are instant.
                try {
                    const blobUrl = await getWorkerBlobUrl();
                    pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
                } catch (workerSetupErr) {
                    console.warn('PDF worker blob setup failed; pdfjs will fall back to main-thread mode:', workerSetupErr);
                }

                let doc;
                try {
                    doc = await loadDoc(false);
                } catch (workerErr: any) {
                    const msg = String(workerErr?.message || workerErr || '');
                    if (/worker|fetch dynamically imported|fake worker|MIME/i.test(msg)) {
                        console.warn('PDF worker failed; falling back to main-thread rendering:', msg);
                        doc = await loadDoc(true);
                    } else {
                        throw workerErr;
                    }
                }
                if (cancelled) {
                    doc.destroy();
                    return;
                }
                docRef.current = doc;
                setNumPages(doc.numPages);
                setLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                console.error('PDF load failed:', e);
                setError(e?.message || 'Could not load PDF');
                setLoading(false);
                onError?.(e);
            }
        };
        load();

        return () => {
            cancelled = true;
            // Cancel any in-flight render tasks
            renderTaskRefs.current.forEach(t => {
                try { t?.cancel(); } catch { /* ignore */ }
            });
            renderTaskRefs.current = [];
            try { docRef.current?.destroy(); } catch { /* ignore */ }
            docRef.current = null;
        };
    }, [src, onError]);

    // Render every page whenever numPages, zoom, or container width changes.
    useEffect(() => {
        if (!docRef.current || !containerRef.current || numPages === 0) return;
        const container = containerRef.current;

        const drawAll = async () => {
            // Clear previous canvases first
            container.innerHTML = '';
            renderTaskRefs.current.forEach(t => {
                try { t?.cancel(); } catch { /* ignore */ }
            });
            renderTaskRefs.current = [];

            const containerWidth = container.clientWidth || 600;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                try {
                    const page = await docRef.current.getPage(pageNum);
                    // First scale 1 to know natural size, then fit-to-width times zoom.
                    const baseViewport = page.getViewport({ scale: 1 });
                    const fitScale = (containerWidth - 4) / baseViewport.width;
                    const finalScale = fitScale * zoom;
                    const viewport = page.getViewport({ scale: finalScale });

                    const canvas = document.createElement('canvas');
                    canvas.style.display = 'block';
                    canvas.style.margin = '0 auto 12px';
                    canvas.style.maxWidth = '100%';
                    canvas.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                    canvas.style.borderRadius = '4px';
                    canvas.style.background = '#fff';
                    canvas.width = Math.floor(viewport.width * dpr);
                    canvas.height = Math.floor(viewport.height * dpr);
                    canvas.style.width = `${viewport.width}px`;
                    canvas.style.height = `${viewport.height}px`;
                    container.appendChild(canvas);

                    const ctx = canvas.getContext('2d');
                    if (!ctx) continue;
                    ctx.scale(dpr, dpr);

                    const task = page.render({ canvasContext: ctx, viewport });
                    renderTaskRefs.current.push(task);
                    await task.promise;
                } catch (e: any) {
                    if (e?.name === 'RenderingCancelledException') {
                        // expected — happens when zoom changes or unmount
                        return;
                    }
                    console.error(`Failed to render page ${pageNum}:`, e);
                }
            }
        };

        drawAll();

        // Re-render on container resize so the page width adapts to
        // orientation changes / window resize.
        let resizeTid: number | null = null;
        const ro = new ResizeObserver(() => {
            if (resizeTid) window.clearTimeout(resizeTid);
            resizeTid = window.setTimeout(() => drawAll(), 250);
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
            if (resizeTid) window.clearTimeout(resizeTid);
        };
    }, [numPages, zoom]);

    if (error) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Empty description={error} />
            </div>
        );
    }

    return (
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {loading && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spin size="large" tip="Loading PDF…" />
                </div>
            )}

            {!loading && (
                <>
                    {/* Floating zoom controls */}
                    <div style={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        zIndex: 5,
                        display: 'flex',
                        gap: 6,
                        background: 'rgba(15,23,42,0.85)',
                        borderRadius: 999,
                        padding: '4px 6px',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    }}>
                        <Button
                            type="text"
                            size="small"
                            icon={<ZoomOutOutlined />}
                            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
                            disabled={zoom <= 0.5}
                            style={{ color: '#fff' }}
                            aria-label="Zoom out"
                        />
                        <span style={{
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            minWidth: 40,
                            justifyContent: 'center',
                        }}>
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button
                            type="text"
                            size="small"
                            icon={<ZoomInOutlined />}
                            onClick={() => setZoom(z => Math.min(3, z + 0.2))}
                            disabled={zoom >= 3}
                            style={{ color: '#fff' }}
                            aria-label="Zoom in"
                        />
                    </div>

                    <div
                        ref={containerRef}
                        style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '12px 8px',
                            background: '#475569',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default PdfViewer;
