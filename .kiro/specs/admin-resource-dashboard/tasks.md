# Admin Resource Dashboard — Tasks

## Task 1: Create AdminResources component with stats and insights
- [ ] 1.1 Create `frontend/src/components/Admin/AdminResources.tsx` with types and state
- [ ] 1.2 Fetch all resources and batches/teachers for filters
- [ ] 1.3 Build stats row: Total Resources, Storage Used, Cloud count, Local count, type counts
- [ ] 1.4 Build insights section: resources per teacher, per batch, file type distribution, storage per teacher
- [ ] 1.5 Build filter bar: search, type, teacher, batch

## Task 2: Build resource table with preview
- [ ] 2.1 Build resource table: Name, File, Type, Teacher, Batch, Size, Storage, Date
- [ ] 2.2 Add secure preview (blob-based) and download buttons
- [ ] 2.3 Add preview modal with PDF/video/audio/image viewers and fullscreen toggle

## Task 3: Add route and sidebar
- [ ] 3.1 Add route in App.tsx: `/app/admin-resources` → AdminResources
- [ ] 3.2 Add sidebar item in Layout.tsx: "Resources" with FolderOutlined icon
- [ ] 3.3 Verify build passes with getDiagnostics
