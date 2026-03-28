# Admin Resource Dashboard — Requirements

## Goal
Create a new admin page "Resources" that provides a comprehensive dashboard view of all learning resources across the platform. Admin can view, filter, preview, and download files but cannot upload. Shows insights like storage usage, resources per teacher/batch, file type distribution, and a full resource table.

## Requirements

### R1: Admin sidebar + route
- Add "Resources" menu item in admin sidebar (FolderOutlined icon)
- Route: `/app/admin-resources`
- New component: `frontend/src/components/Admin/AdminResources.tsx`

### R2: Stats Row
- Total Resources count
- Total Storage Used (sum of file_size, formatted as MB/GB)
- Cloud vs Local storage count
- Resources by type breakdown (PDF, Video, Audio, Doc, Image counts)

### R3: Insights Section
- Resources per Teacher (horizontal bars showing count per teacher)
- Resources per Batch (horizontal bars showing count per batch)
- File Type Distribution (progress bars: PDF %, Video %, Audio %, etc.)
- Storage per Teacher (who uses the most storage)

### R4: Resource Table (read-only)
- All resources across all teachers
- Columns: Resource Name, File Name, Type (colored tag), Teacher, Batch, Size, Storage (Cloud/Local), Date
- Filters: search, type, teacher, batch
- Preview button (same blob-based preview as teacher view)
- Download button (same secure download)
- NO upload, edit, or delete buttons (admin is read-only for resources)

### R5: Preview Modal
- Same preview modal as teacher/student (PDF iframe, video player, audio player, image viewer)
- Fullscreen toggle

## Backend
- The existing `GET /api/resources` endpoint already returns all resources for admin role (no filtering by teacher_id)
- No new backend endpoints needed

## Files to Create/Modify
- CREATE: `frontend/src/components/Admin/AdminResources.tsx`
- MODIFY: `frontend/src/App.tsx` (add route)
- MODIFY: `frontend/src/components/Layout/Layout.tsx` (add sidebar item)
