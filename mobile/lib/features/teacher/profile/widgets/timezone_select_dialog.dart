import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';

class TimezoneGroup {
  final String label;
  final List<TimezoneItem> zones;

  TimezoneGroup({required this.label, required this.zones});

  factory TimezoneGroup.fromJson(Map<String, dynamic> json) {
    final rawZones = json['zones'] as List? ?? [];
    return TimezoneGroup(
      label: json['label'] ?? '',
      zones: rawZones.map((z) => TimezoneItem.fromJson(z)).toList(),
    );
  }
}

class TimezoneItem {
  final String value;
  final String label;

  TimezoneItem({required this.value, required this.label});

  factory TimezoneItem.fromJson(Map<String, dynamic> json) {
    return TimezoneItem(
      value: json['value'] ?? '',
      label: json['label'] ?? '',
    );
  }
}

class TimezoneSelectDialog extends ConsumerStatefulWidget {
  final String? currentTimezone;
  final ValueChanged<String> onSelected;

  const TimezoneSelectDialog({
    super.key,
    this.currentTimezone,
    required this.onSelected,
  });

  static Future<void> show({
    required BuildContext context,
    String? currentTimezone,
    required ValueChanged<String> onSelected,
  }) {
    final isTablet = MediaQuery.of(context).size.width >= 600;
    if (isTablet) {
      return showDialog(
        context: context,
        builder: (ctx) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560, maxHeight: 680),
            child: TimezoneSelectDialog(
              currentTimezone: currentTimezone,
              onSelected: onSelected,
            ),
          ),
        ),
      );
    } else {
      return showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: AppColors.pureWhite,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: TimezoneSelectDialog(
            currentTimezone: currentTimezone,
            onSelected: onSelected,
          ),
        ),
      );
    }
  }

  @override
  ConsumerState<TimezoneSelectDialog> createState() => _TimezoneSelectDialogState();
}

class _TimezoneSelectDialogState extends ConsumerState<TimezoneSelectDialog> {
  final _searchCtrl = TextEditingController();
  List<TimezoneGroup> _groups = [];
  bool _isLoading = true;
  String? _error;
  String _detectedTz = 'UTC';

  @override
  void initState() {
    super.initState();
    _detectLocalTimezone();
    _fetchTimezones();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _detectLocalTimezone() {
    try {
      _detectedTz = DateTime.now().timeZoneName;
      // In Dart mobile DateTime.now().timeZoneName may be abbreviation like 'GMT' or standard name.
    } catch (_) {
      _detectedTz = 'UTC';
    }
  }

  Future<void> _fetchTimezones() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/auth/timezones');
      if (res.data != null && res.data['groups'] is List) {
        final raw = res.data['groups'] as List;
        final list = raw.map((g) => TimezoneGroup.fromJson(g)).toList();
        if (mounted) {
          setState(() {
            _groups = list;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  List<TimezoneItem> _getFilteredZones() {
    final query = _searchCtrl.text.trim().toLowerCase();
    final List<TimezoneItem> result = [];
    for (final group in _groups) {
      for (final zone in group.zones) {
        if (query.isEmpty ||
            zone.label.toLowerCase().contains(query) ||
            zone.value.toLowerCase().contains(query) ||
            group.label.toLowerCase().contains(query)) {
          result.add(zone);
        }
      }
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
    final filtered = _getFilteredZones();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFEFF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.public,
                  color: Color(0xFF0E7490),
                  size: 22,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Sélectionner un fuseau horaire' : 'Select Time Zone',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isFr
                          ? 'Les cours et échéances seront affichés selon ce fuseau.'
                          : 'Classes and deadlines are shown in this zone.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: AppColors.textMuted),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Search Box
          TextField(
            controller: _searchCtrl,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: isFr ? 'Rechercher une ville, un pays...' : 'Search city, country or region...',
              hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textSubtle),
              prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textMuted),
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
              fillColor: AppColors.frenchPaper,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Detected timezone shortcut if applicable
          if (_detectedTz.isNotEmpty && _detectedTz != widget.currentTimezone) ...[
            InkWell(
              onTap: () {
                // Find matching zone or use detected
                final match = _groups
                    .expand((g) => g.zones)
                    .where((z) => z.value == _detectedTz || z.label.contains(_detectedTz))
                    .firstOrNull;
                final picked = match?.value ?? _detectedTz;
                widget.onSelected(picked);
                Navigator.pop(context);
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFC7D2FE)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.my_location, size: 14, color: Color(0xFF4F46E5)),
                    const SizedBox(width: 6),
                    Text(
                      isFr ? 'Détecté : ' : 'Detected: ',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                    Text(
                      _detectedTz,
                      style: AppTypography.caption.copyWith(
                        color: const Color(0xFF4F46E5),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isFr ? '— toucher pour utiliser' : '— tap to use',
                      style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],

          // List of timezones
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Text(
                          isFr ? 'Impossible de charger les fuseaux.' : 'Failed to load timezones.',
                          style: AppTypography.caption.copyWith(color: AppColors.bad),
                        ),
                      )
                    : filtered.isEmpty
                        ? Center(
                            child: Text(
                              isFr ? 'Aucun fuseau trouvé.' : 'No time zones match your search.',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                            ),
                          )
                        : ListView.separated(
                            itemCount: filtered.length,
                            separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
                            itemBuilder: (context, index) {
                              final zone = filtered[index];
                              final isSelected = zone.value == widget.currentTimezone;

                              return ListTile(
                                dense: true,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                leading: Icon(
                                  Icons.access_time,
                                  size: 18,
                                  color: isSelected ? const Color(0xFF4F46E5) : AppColors.textSubtle,
                                ),
                                title: Text(
                                  zone.label,
                                  style: AppTypography.bodySmall.copyWith(
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    color: isSelected ? const Color(0xFF4F46E5) : AppColors.ink,
                                  ),
                                ),
                                subtitle: Text(
                                  zone.value,
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textSubtle,
                                    fontSize: 11,
                                  ),
                                ),
                                trailing: isSelected
                                    ? const Icon(Icons.check_circle, size: 20, color: Color(0xFF4F46E5))
                                    : null,
                                onTap: () {
                                  widget.onSelected(zone.value);
                                  Navigator.pop(context);
                                },
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
