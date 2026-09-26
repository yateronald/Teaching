import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';

/* ══════════════════════════════════════════
   WHERE VISITORS ARE — the same world map as the web console: the same
   country shapes (world-atlas 110m), the same Natural Earth projection
   without Antarctica, the same shading. The shapes ship with the app
   (assets/maps/world_110m.json, projected once), so nothing is fetched and
   no map key is needed.
══════════════════════════════════════════ */

/// What the map is shaded by.
enum MapMeasure { visitors, visits, speed }

/// Light to deep indigo, as on the web.
const mapShades = [Color(0xFFE8EAFF), Color(0xFFC9CDFA), Color(0xFFA5ABF2), Color(0xFF7C83E8), Color(0xFF5A5FDB), Color(0xFF4338CA)];
/// Fast to slow, for the speed view.
const speedShades = [Color(0xFF0E9F6E), Color(0xFF65C18C), Color(0xFFC2D36B), Color(0xFFF0B429), Color(0xFFE8833A), Color(0xFFE02424)];
const _empty = Color(0xFFEEF1F6);
const _ink = Color(0xFF0F172A);

class CountryShape {
  final String? code;
  final String name;
  final Path path;
  final Rect bounds;
  CountryShape(this.code, this.name, this.path) : bounds = path.getBounds();
}

class WorldShapes {
  final double width;
  final double height;
  final List<CountryShape> countries;
  WorldShapes(this.width, this.height, this.countries);

  static Future<WorldShapes>? _loading;

  /// The shapes once read: later maps draw at once, without a loading frame.
  static WorldShapes? loaded;

  /// Loaded once, the first time a map is shown.
  static Future<WorldShapes> load([AssetBundle? bundle]) => _loading ??= _read(bundle ?? rootBundle);

  static Future<WorldShapes> _read(AssetBundle bundle) async {
    final data = jsonDecode(await bundle.loadString('assets/maps/world_110m.json')) as Map<String, dynamic>;
    final scale = (data['scale'] as num).toDouble();
    final shapes = <CountryShape>[];
    for (final c in data['countries'] as List) {
      final path = Path()..fillType = PathFillType.evenOdd;
      for (final ring in c['r'] as List) {
        final flat = (ring as List).cast<num>();
        path.addPolygon([for (var i = 0; i + 1 < flat.length; i += 2) Offset(flat[i] / scale, flat[i + 1] / scale)], true);
      }
      shapes.add(CountryShape(c['c'] as String?, c['n'] as String, path));
    }
    return loaded = WorldShapes((data['w'] as num).toDouble(), (data['h'] as num).toDouble(), shapes);
  }

  /// The country under a point of the map (map coordinates).
  CountryShape? at(Offset p) {
    for (final s in countries) {
      if (s.bounds.contains(p) && s.path.contains(p)) return s;
    }
    return null;
  }
}

/// A country's value for a measure (null when it has none).
num? measureOf(Map<String, dynamic>? c, MapMeasure m) {
  if (c == null) return null;
  final v = switch (m) { MapMeasure.visitors => c['visitors'], MapMeasure.visits => c['visits'], MapMeasure.speed => c['load_p75'] };
  return v is num ? v : num.tryParse('${v ?? ''}');
}

/// Quantile steps, so one very large country does not flatten everyone else (as on the web).
List<num>? shadeSteps(Iterable<Map<String, dynamic>> countries, MapMeasure m) {
  final values = <num>[];
  for (final c in countries) {
    if (c['country'] == '??') continue;
    final v = measureOf(c, m);
    if (v != null && v > 0) values.add(v);
  }
  values.sort();
  if (values.isEmpty) return null;
  num at(double p) => values[(values.length * p).floor().clamp(0, values.length - 1)];
  return [at(0.2), at(0.4), at(0.6), at(0.8), at(0.95)];
}

Color? shadeFor(num? value, List<num>? steps, MapMeasure m) {
  if (value == null || steps == null) return null;
  final palette = m == MapMeasure.speed ? speedShades : mapShades;
  final i = steps.indexWhere((s) => value <= s);
  return palette[i == -1 ? palette.length - 1 : i];
}

/// The shaded world map: pinch to zoom, drag to move, tap a country to pick it.
class VisitorWorldMap extends StatefulWidget {
  /// Countries of the period, by two-letter code.
  final Map<String, Map<String, dynamic>> byCode;
  final MapMeasure measure;
  final String? selected;
  final ValueChanged<({String? code, String name})> onPick;
  const VisitorWorldMap({super.key, required this.byCode, required this.measure, required this.selected, required this.onPick});

  @override
  State<VisitorWorldMap> createState() => _VisitorWorldMapState();
}

class _VisitorWorldMapState extends State<VisitorWorldMap> {
  final _zoom = TransformationController();
  late final Future<WorldShapes> _shapes = WorldShapes.load(DefaultAssetBundle.of(context));
  bool _zoomed = false;

  @override
  void initState() {
    super.initState();
    _zoom.addListener(() {
      final z = _zoom.value.getMaxScaleOnAxis() > 1.01;
      if (z != _zoomed) setState(() => _zoomed = z);
    });
  }

  @override
  void dispose() {
    _zoom.dispose();
    super.dispose();
  }

  void _zoomBy(double factor, Size size) {
    final current = _zoom.value.getMaxScaleOnAxis();
    final next = (current * factor).clamp(1.0, 8.0);
    if (next == 1.0) {
      _zoom.value = Matrix4.identity();
      return;
    }
    // Zoom around the centre of the frame.
    final centre = Offset(size.width / 2, size.height / 2);
    final scene = _zoom.toScene(centre);
    _zoom.value = Matrix4.identity()
      ..translateByDouble(centre.dx - scene.dx * next, centre.dy - scene.dy * next, 0, 1)
      ..scaleByDouble(next, next, 1, 1);
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return FutureBuilder<WorldShapes>(
      future: _shapes,
      initialData: WorldShapes.loaded,
      builder: (context, snap) {
        if (snap.hasError) {
          return SizedBox(height: 160, child: Center(child: Text(fr ? 'La carte n’a pas pu être chargée.' : 'The map could not be loaded.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))));
        }
        final world = snap.data;
        return AspectRatio(
          aspectRatio: 2,
          child: LayoutBuilder(builder: (context, box) {
            final size = Size(box.maxWidth, box.maxHeight);
            return Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
                gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFFFBFCFE), Color(0xFFF5F7FB)]),
              ),
              clipBehavior: Clip.antiAlias,
              child: world == null
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : Stack(children: [
                      Positioned.fill(
                        child: InteractiveViewer(
                          transformationController: _zoom,
                          minScale: 1,
                          maxScale: 8,
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTapUp: (d) {
                              final k = size.width / world.width;
                              final hit = world.at(d.localPosition / k);
                              if (hit != null) widget.onPick((code: hit.code, name: hit.name));
                            },
                            child: Semantics(
                              label: fr ? 'Carte des visiteurs par pays. La liste ci-dessous les détaille.' : 'Visitors by country. The list below details them.',
                              child: CustomPaint(
                                size: size,
                                painter: _WorldPainter(world, widget.byCode, widget.measure, widget.selected, shadeSteps(widget.byCode.values, widget.measure)),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 6,
                        top: 6,
                        child: Column(children: [
                          _ZoomButton(icon: Icons.add, tooltip: fr ? 'Zoomer' : 'Zoom in', onTap: () => _zoomBy(1.5, size)),
                          const SizedBox(height: 4),
                          _ZoomButton(icon: Icons.remove, tooltip: fr ? 'Dézoomer' : 'Zoom out', onTap: () => _zoomBy(1 / 1.5, size)),
                          if (_zoomed) ...[
                            const SizedBox(height: 4),
                            _ZoomButton(icon: Icons.center_focus_strong, tooltip: fr ? 'Réinitialiser' : 'Reset', onTap: () => _zoom.value = Matrix4.identity()),
                          ],
                        ]),
                      ),
                    ]),
            );
          }),
        );
      },
    );
  }
}

class _ZoomButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  const _ZoomButton({required this.icon, required this.tooltip, required this.onTap});

  @override
  Widget build(BuildContext context) => Tooltip(
        message: tooltip,
        child: Material(
          color: AppColors.pureWhite,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: AppColors.border)),
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: onTap,
            child: SizedBox(width: 30, height: 30, child: Icon(icon, size: 16, color: AppColors.ink)),
          ),
        ),
      );
}

class _WorldPainter extends CustomPainter {
  final WorldShapes world;
  final Map<String, Map<String, dynamic>> byCode;
  final MapMeasure measure;
  final String? selected;
  final List<num>? steps;
  _WorldPainter(this.world, this.byCode, this.measure, this.selected, this.steps);

  @override
  void paint(Canvas canvas, Size size) {
    final k = size.width / world.width;
    canvas.save();
    canvas.scale(k);
    final fill = Paint()..style = PaintingStyle.fill;
    final line = Paint()
      ..style = PaintingStyle.stroke
      ..color = Colors.white
      ..strokeWidth = 0.6
      ..strokeJoin = StrokeJoin.round;
    CountryShape? picked;
    for (final s in world.countries) {
      final data = s.code == null ? null : byCode[s.code];
      fill.color = shadeFor(measureOf(data, measure), steps, measure) ?? _empty;
      canvas.drawPath(s.path, fill);
      canvas.drawPath(s.path, line);
      if (s.code != null && s.code == selected) picked = s;
    }
    if (picked != null) {
      canvas.drawPath(picked.path, Paint()
        ..style = PaintingStyle.stroke
        ..color = _ink
        ..strokeWidth = 1.4
        ..strokeJoin = StrokeJoin.round);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_WorldPainter old) =>
      old.world != world || old.byCode != byCode || old.measure != measure || old.selected != selected;
}

/// "fewer ▮▮▮▮▮▮ more" (or fast → slow for speed).
class MapLegend extends StatelessWidget {
  final MapMeasure measure;
  const MapLegend({super.key, required this.measure});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final speed = measure == MapMeasure.speed;
    final style = AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11);
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Text(speed ? (fr ? 'rapide' : 'fast') : (fr ? 'moins' : 'fewer'), style: style),
      const SizedBox(width: 6),
      for (final c in speed ? speedShades : mapShades) Container(width: 16, height: 8, color: c),
      const SizedBox(width: 6),
      Text(speed ? (fr ? 'lent' : 'slow') : (fr ? 'plus' : 'more'), style: style),
    ]);
  }
}
