import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'batch_detail_panel.dart';
import 'batch_utils.dart';

class _Slot {
  TimeOfDay start;
  TimeOfDay end;
  bool custom = false;
  String mode;
  String location;
  String link;
  _Slot({required this.start, required this.end, this.mode = 'online', this.location = '', this.link = ''});
}

/// Creates a batch in three steps (details, weekly schedule, students) or
/// edits one (details and schedule; students are managed from its panel).
/// Pops `true` once saved.
class BatchEditorPanel extends ConsumerStatefulWidget {
  final List<Map<String, dynamic>> teachers;
  final Map<String, dynamic>? batch;
  final List<Map<String, dynamic>> timetable;
  final int initialStep;

  const BatchEditorPanel({super.key, required this.teachers, this.batch, this.timetable = const [], this.initialStep = 0});

  @override
  ConsumerState<BatchEditorPanel> createState() => _BatchEditorPanelState();
}

class _BatchEditorPanelState extends ConsumerState<BatchEditorPanel> {
  static const _defaultStart = TimeOfDay(hour: 18, minute: 0);
  static const _defaultEnd = TimeOfDay(hour: 19, minute: 30);

  late int _step = widget.initialStep;
  late final _name = TextEditingController(text: J.s(widget.batch?['name']));
  late final _link = TextEditingController(text: J.s(widget.batch?['default_link']));
  late final _place = TextEditingController(text: J.s(widget.batch?['default_location']));
  late String? _level = J.s(widget.batch?['french_level']).isEmpty ? null : J.s(widget.batch?['french_level']).toUpperCase();
  late int? _teacher = widget.batch?['teacher_id'] == null ? null : J.i(widget.batch?['teacher_id']);
  late DateTime? _start = J.date(widget.batch?['start_date']);
  late DateTime? _end = J.date(widget.batch?['end_date']);
  late String _tz = J.s(widget.batch?['timezone']).isEmpty ? 'Europe/Paris' : J.s(widget.batch?['timezone']);
  late String _mode = J.s(widget.batch?['default_location_mode']) == 'physical' ? 'physical' : 'online';
  final Map<int, _Slot> _slots = {};
  bool _sameTime = true;
  TimeOfDay _masterStart = _defaultStart;
  TimeOfDay _masterEnd = _defaultEnd;
  final Set<int> _picked = {};
  bool _saving = false;
  String? _error;

  bool get _editing => widget.batch != null;
  int get _steps => _editing ? 2 : 3;

  @override
  void initState() {
    super.initState();
    for (final t in widget.timetable) {
      final d = J.i(t['day_of_week']);
      _slots[d] = _Slot(
        start: _parse(t['start_time']) ?? _defaultStart,
        end: _parse(t['end_time']) ?? _defaultEnd,
        mode: J.s(t['location_mode']).isEmpty ? _mode : J.s(t['location_mode']),
        location: J.s(t['location']),
        link: J.s(t['link']),
      );
      _slots[d]!.custom = _slots[d]!.mode != _mode ||
          (_slots[d]!.mode == 'online' ? _slots[d]!.link != _link.text && _slots[d]!.link.isNotEmpty : _slots[d]!.location != _place.text && _slots[d]!.location.isNotEmpty);
    }
    if (_slots.isNotEmpty) {
      final first = _slots.values.first;
      _masterStart = first.start;
      _masterEnd = first.end;
      _sameTime = _slots.values.every((s) => s.start == first.start && s.end == first.end);
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _link.dispose();
    _place.dispose();
    super.dispose();
  }

  TimeOfDay? _parse(dynamic t) {
    final p = BatchX.hhmm(t).split(':');
    if (p.length < 2) return null;
    return TimeOfDay(hour: int.tryParse(p[0]) ?? 0, minute: int.tryParse(p[1]) ?? 0);
  }

  String _fmt(TimeOfDay t) => '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  int _mins(TimeOfDay t) => t.hour * 60 + t.minute;

  List<int> get _days => BatchX.week.where(_slots.containsKey).toList();

  TimeOfDay _startOf(int d) => _sameTime ? _masterStart : _slots[d]!.start;
  TimeOfDay _endOf(int d) => _sameTime ? _masterEnd : _slots[d]!.end;
  List<int> get _badDays => _days.where((d) => _mins(_endOf(d)) <= _mins(_startOf(d))).toList();

  void _setDays(Iterable<int> days) {
    setState(() {
      _slots.removeWhere((d, _) => !days.contains(d));
      for (final d in days) {
        _slots.putIfAbsent(d, () => _Slot(start: _masterStart, end: _masterEnd, mode: _mode));
      }
    });
  }

  Future<void> _pickDates() async {
    final now = DateTime.now();
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 3),
      lastDate: DateTime(now.year + 3),
      initialDateRange: _start != null && _end != null && !_end!.isBefore(_start!) ? DateTimeRange(start: _start!, end: _end!) : null,
    );
    if (range != null) {
      setState(() {
        _start = range.start;
        _end = range.end;
      });
    }
  }

  Future<TimeOfDay?> _pickTime(TimeOfDay t) => showTimePicker(context: context, initialTime: t);

  bool _validateStep(int step) {
    final fr = context.isFrench;
    setState(() => _error = null);
    if (step == 0) {
      if (_name.text.trim().isEmpty || _level == null || _teacher == null || _start == null || _end == null) {
        setState(() => _error = fr ? 'Renseignez le nom, le niveau, le professeur et les dates.' : 'Fill in the name, level, teacher and dates.');
        return false;
      }
      if (!_end!.isAfter(_start!)) {
        setState(() => _error = fr ? 'La date de fin doit être après la date de début.' : 'The end date must be after the start date.');
        return false;
      }
    }
    if (step == 1 && _badDays.isNotEmpty) {
      setState(() => _error = fr
          ? "Vérifiez l'heure de ${_badDays.map((d) => BatchX.dayLong(d, true)).join(', ')} : la fin doit suivre le début."
          : 'Check the times for ${_badDays.map((d) => BatchX.dayLong(d, false)).join(', ')}: the end must be after the start.');
      return false;
    }
    return true;
  }

  Future<void> _next() async {
    if (!_validateStep(_step)) return;
    if (_step < _steps - 1) {
      setState(() => _step++);
    } else {
      await _save();
    }
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    if (!_validateStep(0)) {
      setState(() => _step = 0);
      return;
    }
    if (!_validateStep(1)) {
      setState(() => _step = 1);
      return;
    }
    if (!_editing && _picked.isEmpty) {
      setState(() => _error = fr ? 'Choisissez au moins un étudiant.' : 'Choose at least one student for this batch.');
      return;
    }
    final original = widget.batch;
    bool sameDay(DateTime? a, DateTime? b) => a != null && b != null && a.year == b.year && a.month == b.month && a.day == b.day;
    final startIso = original != null && sameDay(J.date(original['start_date']), _start)
        ? J.s(original['start_date'])
        : DateTime(_start!.year, _start!.month, _start!.day).toUtc().toIso8601String();
    final endIso = original != null && sameDay(J.date(original['end_date']), _end)
        ? J.s(original['end_date'])
        : DateTime(_end!.year, _end!.month, _end!.day, 23, 59, 59).toUtc().toIso8601String();

    final timetable = [
      for (final d in _days)
        {
          'day_of_week': d,
          'start_time': _fmt(_startOf(d)),
          'end_time': _fmt(_endOf(d)),
          'timezone': _tz,
          'location_mode': !_sameTime && _slots[d]!.custom ? _slots[d]!.mode : _mode,
          'location': !_sameTime && _slots[d]!.custom ? _slots[d]!.location : _place.text.trim(),
          'link': !_sameTime && _slots[d]!.custom ? _slots[d]!.link : _link.text.trim(),
        },
    ];
    final payload = <String, dynamic>{
      'name': _name.text.trim(),
      'french_level': _level,
      'teacher_id': _teacher,
      'start_date': startIso,
      'end_date': endIso,
      'timezone': _tz,
      'default_location_mode': _mode,
      'default_location': _place.text.trim(),
      'default_link': _link.text.trim(),
      if (_editing || timetable.isNotEmpty) 'timetable': timetable,
      if (!_editing) 'student_ids': _picked.toList(),
    };
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      if (_editing) {
        await api.put('/batches/${J.i(original!['id'])}', data: payload);
      } else {
        await api.post('/batches', data: payload);
      }
      if (!mounted) return;
      adminToast(
        context,
        _editing
            ? (fr ? 'Promotion mise à jour' : 'Batch updated')
            : (fr ? '« ${payload['name']} » créée : le professeur et ${_picked.length} étudiant${_picked.length > 1 ? 's ont' : ' a'} été prévenus' : '“${payload['name']}” created: the teacher and ${_picked.length} student${_picked.length > 1 ? 's were' : ' was'} notified'),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final labels = [fr ? 'Détails' : 'Details', fr ? 'Horaires' : 'Schedule', if (!_editing) (fr ? 'Étudiants' : 'Students')];
    final last = _step == _steps - 1;
    return AdminPanel(
      title: _editing ? (fr ? 'Modifier la promotion' : 'Edit batch') : (fr ? 'Nouvelle promotion' : 'New batch'),
      subtitle: fr ? 'Étape ${_step + 1} sur $_steps · ${labels[_step]}' : 'Step ${_step + 1} of $_steps · ${labels[_step]}',
      actions: [
        AdminButton(
          _step > 0 ? (fr ? 'Retour' : 'Back') : (fr ? 'Annuler' : 'Cancel'),
          primary: false,
          onPressed: _saving
              ? null
              : () {
                  if (_step > 0) {
                    setState(() {
                      _error = null;
                      _step--;
                    });
                  } else {
                    Navigator.of(context).pop(false);
                  }
                },
        ),
        AdminButton(
          last ? (_editing ? (fr ? 'Enregistrer' : 'Save') : (fr ? 'Créer la promotion' : 'Create batch')) : (fr ? 'Suivant' : 'Next'),
          icon: last ? Icons.check : Icons.arrow_forward,
          busy: _saving,
          onPressed: _next,
        ),
      ],
      children: [
        _Stepper(labels: labels, current: _step, onTap: (i) {
          if (i < _step || (_editing && _validateStep(_step))) setState(() => _step = i);
        }),
        const SizedBox(height: 16),
        if (_step == 0) ..._details(fr),
        if (_step == 1) ..._schedule(fr),
        if (_step == 2) ..._studentsStep(fr),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.badBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.badBorder)),
            child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
          ),
        ],
      ],
    );
  }

  List<Widget> _details(bool fr) => [
        AdminField(label: fr ? 'Nom de la promotion' : 'Batch name', hint: fr ? 'ex. B1 Soir – Automne' : 'e.g. B1 Evening – Fall', controller: _name),
        Text(fr ? 'Niveau de français' : 'French level', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final l in BatchX.levels)
              ChoiceChip(
                label: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(l, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: _level == l ? AppColors.pureWhite : Pill.levelColor(l))),
                    Text(BatchX.levelHint(l, fr), style: AppTypography.caption.copyWith(fontSize: 10, color: _level == l ? AppColors.pureWhite : AppColors.textMuted)),
                  ],
                ),
                selected: _level == l,
                showCheckmark: false,
                selectedColor: Pill.levelColor(l),
                backgroundColor: AppColors.pureWhite,
                side: BorderSide(color: _level == l ? Pill.levelColor(l) : AppColors.border),
                onSelected: (_) => setState(() => _level = l),
              ),
          ],
        ),
        const SizedBox(height: 16),
        AdminSelect<int?>(
          label: fr ? 'Professeur' : 'Teacher',
          value: _teacher,
          options: [for (final t in widget.teachers) FilterOption<int?>(J.i(t['id']), J.name(t).isEmpty ? J.s(t['email']) : J.name(t))],
          onChanged: (v) => setState(() => _teacher = v),
        ),
        InkWell(
          onTap: _pickDates,
          borderRadius: BorderRadius.circular(10),
          child: InputDecorator(
            decoration: adminInputDecoration(fr ? 'Dates de début et de fin' : 'Start and end dates', suffix: const Icon(Icons.date_range, color: AppColors.textMuted)),
            child: Text(
              _start == null || _end == null ? (fr ? 'Choisir' : 'Choose') : '${AdminFmt.day(context, _start)} → ${AdminFmt.day(context, _end)}',
              style: AppTypography.bodyMedium,
            ),
          ),
        ),
      ];

  List<Widget> _schedule(bool fr) {
    final weekly = _days.fold<int>(0, (s, d) => s + (_mins(_endOf(d)) - _mins(_startOf(d))).clamp(0, 1440));
    return [
      AdminSelect<String>(
        label: fr ? 'Fuseau horaire' : 'Timezone',
        value: _tz,
        options: [for (final z in {_tz, ...BatchX.timezones}) FilterOption(z, z.replaceAll('_', ' '))],
        onChanged: (v) => setState(() => _tz = v ?? _tz),
      ),
      Text(fr ? 'Les cours ont lieu' : 'Classes take place', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      SegmentedButton<String>(
        segments: [
          ButtonSegment(value: 'online', icon: const Icon(Icons.videocam_outlined, size: 18), label: Text(fr ? 'En ligne' : 'Online')),
          ButtonSegment(value: 'physical', icon: const Icon(Icons.place_outlined, size: 18), label: Text(fr ? 'En présentiel' : 'In person')),
        ],
        selected: {_mode},
        onSelectionChanged: (s) => setState(() => _mode = s.first),
      ),
      const SizedBox(height: 14),
      if (_mode == 'online')
        AdminField(label: fr ? 'Lien de réunion (facultatif)' : 'Meeting link (optional)', hint: 'https://…', controller: _link, keyboardType: TextInputType.url)
      else
        AdminField(label: fr ? 'Salle ou adresse (facultatif)' : 'Classroom or address (optional)', controller: _place),
      PanelSection(
        fr ? 'Cours hebdomadaires' : 'Weekly classes',
        trailing: Text(
          _days.isEmpty ? '' : (fr ? '${_days.length}/sem. · ${BatchX.hoursText(weekly)}' : '${_days.length}/week · ${BatchX.hoursText(weekly)}'),
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700),
        ),
      ),
      Wrap(
        spacing: 6,
        runSpacing: 6,
        children: [
          for (final d in BatchX.week)
            FilterChip(
              label: Text(BatchX.dayShort(d, fr)),
              selected: _slots.containsKey(d),
              showCheckmark: false,
              selectedColor: AppColors.adminAccent,
              labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: _slots.containsKey(d) ? AppColors.pureWhite : AppColors.text),
              backgroundColor: AppColors.pureWhite,
              side: BorderSide(color: _slots.containsKey(d) ? AppColors.adminAccent : AppColors.border),
              onSelected: (on) => _setDays(on ? {..._days, d} : _days.where((x) => x != d)),
            ),
        ],
      ),
      const SizedBox(height: 6),
      Wrap(
        spacing: 4,
        children: [
          TextButton(onPressed: () => _setDays([1, 2, 3, 4, 5]), child: Text(fr ? 'Semaine' : 'Weekdays')),
          TextButton(onPressed: () => _setDays([6, 0]), child: Text(fr ? 'Week-end' : 'Weekends')),
          TextButton(onPressed: () => _setDays(BatchX.week), child: Text(fr ? 'Tous les jours' : 'Every day')),
          if (_days.isNotEmpty) TextButton(onPressed: () => _setDays(const []), child: Text(fr ? 'Effacer' : 'Clear')),
        ],
      ),
      if (_days.isEmpty)
        Text(fr ? 'Pas de cours réguliers : vous pourrez les ajouter plus tard.' : 'No regular classes yet: you can add them later.', style: AppTypography.caption.copyWith(color: AppColors.textMuted))
      else ...[
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          value: _sameTime,
          activeThumbColor: AppColors.adminAccent,
          title: Text(fr ? 'Même horaire chaque jour de cours' : 'Same time every class day', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
          onChanged: (v) => setState(() {
            _sameTime = v;
            if (!v) {
              for (final d in _days) {
                _slots[d]!.start = _masterStart;
                _slots[d]!.end = _masterEnd;
              }
            }
          }),
        ),
        if (_sameTime)
          _TimeRow(
            label: fr ? 'Chaque cours' : 'Every class',
            start: _masterStart,
            end: _masterEnd,
            bad: _mins(_masterEnd) <= _mins(_masterStart),
            onStart: () async {
              final t = await _pickTime(_masterStart);
              if (t != null) setState(() => _masterStart = t);
            },
            onEnd: () async {
              final t = await _pickTime(_masterEnd);
              if (t != null) setState(() => _masterEnd = t);
            },
          )
        else
          for (final d in _days) _daySlot(d, fr),
      ],
    ];
  }

  Widget _daySlot(int d, bool fr) {
    final s = _slots[d]!;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
      child: Column(
        children: [
          _TimeRow(
            label: BatchX.dayLong(d, fr),
            start: s.start,
            end: s.end,
            bad: _mins(s.end) <= _mins(s.start),
            onStart: () async {
              final t = await _pickTime(s.start);
              if (t != null) setState(() => s.start = t);
            },
            onEnd: () async {
              final t = await _pickTime(s.end);
              if (t != null) setState(() => s.end = t);
            },
            trailing: TextButton(
              onPressed: () => setState(() {
                s.custom = !s.custom;
                if (s.custom) s.mode = _mode;
              }),
              child: Text(s.custom ? (fr ? 'Lieu propre' : 'Custom place') : (fr ? 'Lieu par défaut' : 'Default place'), style: const TextStyle(fontSize: 12)),
            ),
          ),
          if (s.custom) ...[
            const SizedBox(height: 8),
            SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'online', label: Text(fr ? 'En ligne' : 'Online')),
                ButtonSegment(value: 'physical', label: Text(fr ? 'Présentiel' : 'In person')),
              ],
              selected: {s.mode},
              onSelectionChanged: (v) => setState(() => s.mode = v.first),
            ),
            const SizedBox(height: 8),
            TextFormField(
              initialValue: s.mode == 'online' ? s.link : s.location,
              key: ValueKey('$d-${s.mode}'),
              onChanged: (v) => s.mode == 'online' ? s.link = v : s.location = v,
              decoration: adminInputDecoration(s.mode == 'online' ? (fr ? 'Lien de réunion' : 'Meeting link') : (fr ? 'Salle ou adresse' : 'Room or address')),
            ),
          ],
        ],
      ),
    );
  }

  List<Widget> _studentsStep(bool fr) => [
        Text(
          fr ? 'Le professeur et les étudiants choisis reçoivent un e-mail avec l’emploi du temps.' : 'The teacher and the chosen students get an email with the timetable.',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 12),
        AdminButton(
          _picked.isEmpty ? (fr ? 'Choisir des étudiants' : 'Choose students') : (fr ? 'Modifier la sélection (${_picked.length})' : 'Change selection (${_picked.length})'),
          icon: Icons.group_add_outlined,
          primary: false,
          onPressed: () async {
            final ids = await showAdminPanel<List<int>>(context, builder: (_) => StudentPicker(initial: _picked, title: fr ? 'Étudiants de la promotion' : 'Batch students'));
            if (ids != null) {
              setState(() {
                _picked
                  ..clear()
                  ..addAll(ids);
              });
            }
          },
        ),
        const SizedBox(height: 10),
        Text(
          fr ? '${_picked.length} étudiant${_picked.length > 1 ? 's' : ''} sélectionné${_picked.length > 1 ? 's' : ''}' : '${_picked.length} student${_picked.length == 1 ? '' : 's'} selected',
          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: _picked.isEmpty ? AppColors.bad : AppColors.good),
        ),
      ];
}

class _Stepper extends StatelessWidget {
  final List<String> labels;
  final int current;
  final ValueChanged<int> onTap;
  const _Stepper({required this.labels, required this.current, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < labels.length; i++) ...[
          if (i > 0) Expanded(child: Container(height: 2, color: i <= current ? AppColors.adminAccent : AppColors.border)),
          InkWell(
            onTap: () => onTap(i),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircleAvatar(
                    radius: 12,
                    backgroundColor: i <= current ? AppColors.adminAccent : AppColors.borderSoft,
                    child: i < current
                        ? const Icon(Icons.check, size: 14, color: AppColors.pureWhite)
                        : Text('${i + 1}', style: AppTypography.caption.copyWith(color: i == current ? AppColors.pureWhite : AppColors.textMuted, fontWeight: FontWeight.w800)),
                  ),
                  const SizedBox(width: 6),
                  Text(labels[i], style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: i == current ? AppColors.ink : AppColors.textMuted)),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _TimeRow extends StatelessWidget {
  final String label;
  final TimeOfDay start;
  final TimeOfDay end;
  final bool bad;
  final VoidCallback onStart;
  final VoidCallback onEnd;
  final Widget? trailing;
  const _TimeRow({required this.label, required this.start, required this.end, required this.bad, required this.onStart, required this.onEnd, this.trailing});

  @override
  Widget build(BuildContext context) {
    Widget chip(TimeOfDay t, VoidCallback onTap) => ActionChip(
          label: Text(t.format(context), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: bad ? AppColors.bad : AppColors.ink)),
          avatar: const Icon(Icons.schedule, size: 16),
          onPressed: onTap,
          backgroundColor: AppColors.pureWhite,
          side: BorderSide(color: bad ? AppColors.bad : AppColors.border),
        );
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 8,
      runSpacing: 6,
      children: [
        SizedBox(width: 92, child: Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700))),
        chip(start, onStart),
        const Text('→'),
        chip(end, onEnd),
        ?trailing,
      ],
    );
  }
}
