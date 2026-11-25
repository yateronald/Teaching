import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../localization/translations.dart';
import '../utils/schedule_timezone.dart';

const _tzNavy = Color(0xFF183961);
const _tzSoft = Color(0xFFEDF2F8);
const _tzBorder = Color(0xFFCBD8E8);
const _tzInk = Color(0xFF0B1733);
const _tzMuted = Color(0xFF5D687D);

/// Searchable IANA timezone selector shared across all scheduling and meeting forms.
class TimezonePickerField extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;
  final String? label;
  final String? helperText;
  final String? suggestedZone;
  final String? suggestedLabel;
  final String? profileZone;
  final bool enabled;

  const TimezonePickerField({
    super.key,
    required this.value,
    required this.onChanged,
    this.label,
    this.helperText,
    this.suggestedZone,
    this.suggestedLabel,
    this.profileZone,
    this.enabled = true,
  });

  Future<void> _openPicker(BuildContext context) async {
    if (!enabled) return;
    final isTablet = MediaQuery.of(context).size.width >= 600;
    final picker = _TimezonePickerModal(
      currentValue: value,
      suggestedZone: suggestedZone,
      suggestedLabel: suggestedLabel,
      profileZone: profileZone,
      onSelected: onChanged,
    );

    if (isTablet) {
      await showDialog<void>(
        context: context,
        builder: (_) => Dialog(
          backgroundColor: AppColors.pureWhite,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520, maxHeight: 640),
            child: picker,
          ),
        ),
      );
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.82,
        decoration: const BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: picker,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final offset = ScheduleTz.offsetLabel(value);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        InkWell(
          onTap: enabled ? () => _openPicker(context) : null,
          borderRadius: BorderRadius.circular(10),
          child: InputDecorator(
            decoration: InputDecoration(
              labelText: label ?? (fr ? 'Fuseau horaire' : 'Timezone'),
              filled: true,
              fillColor: enabled ? AppColors.pureWhite : AppColors.surfaceSoft,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              labelStyle: AppTypography.bodySmall.copyWith(color: _tzMuted),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                const Icon(Icons.public, size: 18, color: _tzNavy),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    ScheduleTz.displayName(value),
                    style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600, color: _tzInk),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _tzSoft,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: _tzBorder),
                  ),
                  child: Text(
                    offset,
                    style: AppTypography.caption.copyWith(color: _tzNavy, fontWeight: FontWeight.w700, fontSize: 11),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.keyboard_arrow_down, size: 20, color: _tzMuted),
              ],
            ),
          ),
        ),
        if (helperText != null && helperText!.trim().isNotEmpty) ...[
          const SizedBox(height: 5),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              helperText!,
              style: AppTypography.caption.copyWith(color: _tzMuted, height: 1.35),
            ),
          ),
        ],
      ],
    );
  }
}

class _TimezonePickerModal extends StatefulWidget {
  final String currentValue;
  final String? suggestedZone;
  final String? suggestedLabel;
  final String? profileZone;
  final ValueChanged<String> onSelected;

  const _TimezonePickerModal({
    required this.currentValue,
    this.suggestedZone,
    this.suggestedLabel,
    this.profileZone,
    required this.onSelected,
  });

  @override
  State<_TimezonePickerModal> createState() => _TimezonePickerModalState();
}

class _TimezonePickerModalState extends State<_TimezonePickerModal> {
  final _searchCtrl = TextEditingController();
  late final List<String> _allZones = ScheduleTz.allZones();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<String> get _filtered {
    final q = _searchCtrl.text.trim().toLowerCase();
    if (q.isEmpty) return _allZones;
    return _allZones.where((z) {
      final offset = ScheduleTz.offsetLabel(z).toLowerCase();
      final city = ScheduleTz.cityLabel(z).toLowerCase();
      return z.toLowerCase().contains(q) || z.replaceAll('_', ' ').toLowerCase().contains(q) || city.contains(q) || offset.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final list = _filtered;
    final suggested = widget.suggestedZone?.trim();
    final profile = widget.profileZone?.trim();
    final showSuggested = suggested != null && suggested.isNotEmpty && ScheduleTz.isValid(suggested) && suggested != widget.currentValue;
    final showProfile = profile != null && profile.isNotEmpty && ScheduleTz.isValid(profile) && profile != widget.currentValue && profile != suggested;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: _tzSoft,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _tzBorder),
                  ),
                  child: const Icon(Icons.public, color: _tzNavy, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fr ? 'Choisir un fuseau horaire' : 'Select timezone',
                        style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: _tzInk),
                      ),
                      Text(
                        fr ? 'Les horaires saisis seront convertis avec exactitude.' : 'Entered date and time use this timezone.',
                        style: AppTypography.caption.copyWith(color: _tzMuted),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: _tzMuted),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: fr ? 'Rechercher une ville, un pays ou GMT...' : 'Search city, region, or GMT offset...',
                hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textSubtle),
                prefixIcon: const Icon(Icons.search, size: 20, color: _tzMuted),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.surfaceSoft,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _tzNavy, width: 1.5)),
              ),
            ),
            if (showSuggested || showProfile) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  if (showSuggested)
                    ActionChip(
                      avatar: const Icon(Icons.person_pin_circle_outlined, size: 16, color: _tzNavy),
                      label: Text('${widget.suggestedLabel ?? (fr ? 'Fuseau du prospect' : 'Prospect timezone')}: ${ScheduleTz.displayName(suggested)}'),
                      backgroundColor: _tzSoft,
                      side: const BorderSide(color: _tzBorder),
                      labelStyle: AppTypography.caption.copyWith(color: _tzNavy, fontWeight: FontWeight.w700),
                      onPressed: () {
                        widget.onSelected(suggested);
                        Navigator.of(context).pop();
                      },
                    ),
                  if (showProfile)
                    ActionChip(
                      avatar: const Icon(Icons.account_circle_outlined, size: 16, color: _tzNavy),
                      label: Text('${fr ? 'Mon fuseau' : 'My timezone'}: ${ScheduleTz.displayName(profile)}'),
                      backgroundColor: _tzSoft,
                      side: const BorderSide(color: _tzBorder),
                      labelStyle: AppTypography.caption.copyWith(color: _tzNavy, fontWeight: FontWeight.w700),
                      onPressed: () {
                        widget.onSelected(profile);
                        Navigator.of(context).pop();
                      },
                    ),
                ],
              ),
            ],
            const SizedBox(height: 10),
            Expanded(
              child: list.isEmpty
                  ? Center(
                      child: Text(
                        fr ? 'Aucun fuseau trouvé.' : 'No matching timezones.',
                        style: AppTypography.bodySmall.copyWith(color: _tzMuted),
                      ),
                    )
                  : ListView.separated(
                      itemCount: list.length,
                      separatorBuilder: (_, _) => const Divider(height: 1, color: AppColors.borderSoft),
                      itemBuilder: (ctx, i) {
                        final z = list[i];
                        final selected = z == widget.currentValue;
                        final offset = ScheduleTz.offsetLabel(z);
                        return ListTile(
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          title: Text(
                            ScheduleTz.cityLabel(z),
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                              color: selected ? _tzNavy : _tzInk,
                            ),
                          ),
                          subtitle: Text(
                            '$z · $offset',
                            style: AppTypography.caption.copyWith(color: _tzMuted, fontSize: 11.5),
                          ),
                          trailing: selected
                              ? const Icon(Icons.check_circle, size: 20, color: _tzNavy)
                              : Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceSoft,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(offset, style: AppTypography.caption.copyWith(color: _tzMuted, fontSize: 11)),
                                ),
                          onTap: () {
                            widget.onSelected(z);
                            Navigator.of(context).pop();
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
