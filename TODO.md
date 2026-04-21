# TODO: Fix SQL Error - Unknown column 'riderProfile'

## Steps to Complete:

- [x] **Step 1**: Edit `app/Http/Controllers/AdminController.php` - Remove `'riderProfile'` from select columns in `logistics()` method
- [x] **Step 2**: Clear route cache: `php artisan route:clear`
- [x] **Step 3**: Test `/admin/logistics` endpoint in browser/Postman - Fixed SQL error, now returns JSON with user data + riderProfile relation (assuming data exists)
- [x] **Step 4**: Verify frontend `resources/js/Pages/admin/logistics-list.jsx` displays vehicle_type from relation - Accesses `rider.riderProfile.vehicle_type` correctly via eager-loaded relation
- [x] **Step 5**: Update this TODO.md with completion status
- [x] **Step 6**: Run `attempt_completion` once verified working \n\n**Progress**: All steps completed ✅
