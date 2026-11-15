import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'campaign_ai.dart';
import 'marketing_model.dart';
import 'marketing_widgets.dart';

/// Creates a campaign or changes one: what it is, its words in French and
/// English, the class, the price, when and where the site shows it, its look
/// and how people register. Pops the new campaign's id (creation) or true.
class CampaignEditorPanel extends ConsumerStatefulWidget {
  final Campaign? campaign;
  const CampaignEditorPanel({super.key, this.campaign});

  @override
  ConsumerState<CampaignEditorPanel> createState() => _CampaignEditorPanelState();
}

const _langFields = ['title', 'tagline', 'description', 'highlights', 'badge', 'cta', 'schedule', 'price_note'];

class _CampaignEditorPanelState extends ConsumerState<CampaignEditorPanel> {
  Campaign? get _c => widget.campaign;
  bool get _editing => _c != null;

  late final Map<String, TextEditingController> _words = {
    for (final f in _langFields)
      for (final l in ['fr', 'en'])
        '${f}_$l': TextEditingController(
          text: f == 'highlights' ? (_c?.raw['highlights_$l'] is List ? (_c!.raw['highlights_$l'] as List).join('\n') : '') : (_c?.own(f, l) ?? ''),
        ),
  };
  late final _level = TextEditingController(text: _c?.level ?? '');
  late final _teacher = TextEditingController(text: _c?.teacher ?? '');
  late final _seats = TextEditingController(text: _editing ? (_c!.seatLimit?.toString() ?? '') : '8');
  late final _regular = TextEditingController(text: _num(_c?.priceRegular));
  late final _promo = TextEditingController(text: _num(_c?.pricePromo));
  late final _url = TextEditingController(text: _c?.ctaUrl ?? '');
  late final _priority = TextEditingController(text: '${_c?.priority ?? 0}');

  late String _kind = _c?.kind ?? 'group_class';
  late String _audience = _c?.audience ?? 'general';
  late String _currency = _c?.currency ?? 'CAD';
  late DateTime? _classStarts = _c?.classStartsOn;
  late DateTime? _classEnds = _c?.classEndsOn;
  late DateTime _startsAt = _c?.startsAt ?? DateTime.now();
  late DateTime? _endsAt = _editing ? _c!.endsAt : _endOfDay(DateTime.now().add(const Duration(days: 21)));
  late bool _showSeats = _c?.showSeats ?? true;
  late bool _showCountdown = _c?.showCountdown ?? true;
  late bool _bar = _c?.placeBar ?? false;
  late bool _home = _c?.placeHome ?? true;
  late bool _flash = _c?.placeFlash ?? false;
  late bool _learn = _c?.placeLearn ?? true;
  late String _theme = _c?.theme ?? 'navy';
  late String? _image = _c?.imageKey;
  late String _mode = _c?.registrationMode ?? 'form';
  String? _lang;
  bool _saving = false;
  String? _error;
  // The form before the AI wrote in it (for « Undo »), and the AI's art direction for a new picture.
  Map<String, dynamic>? _beforeAi;
  String _imagePrompt = '';

  static String _num(num? v) => v == null ? '' : (v % 1 == 0 ? '${v.toInt()}' : '$v');
  static DateTime _endOfDay(DateTime d) => DateTime(d.year, d.month, d.day, 23, 59);
  static String _day(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  @override
  void initState() {
    super.initState();
    // The preview follows every keystroke.
    for (final c in [..._words.values, _level, _teacher, _seats, _regular, _promo, _url, _priority]) {
      c.addListener(_changed);
    }
  }

  void _changed() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    for (final c in [..._words.values, _level, _teacher, _seats, _regular, _promo, _url, _priority]) {
      c.dispose();
    }
    super.dispose();
  }

  String? _text(TextEditingController c) => c.text.trim().isEmpty ? null : c.text.trim();
  num? _money(TextEditingController c) => c.text.trim().isEmpty ? null : num.tryParse(c.text.trim().replaceAll(',', '.').replaceAll(' ', ''));

  /// The campaign as the API takes it.
  Map<String, dynamic> _body() => {
    'kind': _kind,
    for (final f in _langFields)
      for (final l in ['fr', 'en'])
        '${f}_$l': f == 'highlights'
            ? _words['highlights_$l']!.text.split('\n').map((e) => e.trim()).where((e) => e.isNotEmpty).take(6).toList()
            : _text(_words['${f}_$l']!),
    'audience': _audience,
    'level': _text(_level),
    'class_starts_on': _classStarts == null ? null : _day(_classStarts!),
    'class_ends_on': _classEnds == null ? null : _day(_classEnds!),
    'teacher_name': _text(_teacher),
    'seat_limit': _seats.text.trim().isEmpty ? null : int.tryParse(_seats.text.trim()),
    'show_seats': _showSeats,
    'price_regular': _money(_regular),
    'price_promo': _money(_promo),
    'currency': _currency,
    'starts_at': _startsAt.toUtc().toIso8601String(),
    'ends_at': _endsAt?.toUtc().toIso8601String(),
    'show_countdown': _showCountdown,
    'place_bar': _bar,
    'place_home': _home,
    'place_flash': _flash,
    'place_learn': _learn,
    'priority': int.tryParse(_priority.text.trim()) ?? 0,
    'theme': _theme,
    'image_key': _image,
    'registration_mode': _mode,
    'cta_url': _mode == 'link' ? _text(_url) : null,
  };

  /// Fills the form with a campaign as the API gives it (the AI's draft, or the state before it).
  void _apply(Map<String, dynamic> f, {bool keepAiImage = true}) {
    String text(dynamic v) => v == null ? '' : '$v';
    for (final field in _langFields) {
      for (final l in ['fr', 'en']) {
        final v = f['${field}_$l'];
        _words['${field}_$l']!.text = field == 'highlights' ? (v is List ? v.map((e) => '$e').join('\n') : '') : text(v);
      }
    }
    _level.text = text(f['level']);
    _teacher.text = text(f['teacher_name']);
    _seats.text = f['seat_limit'] == null ? '' : '${J.i(f['seat_limit'])}';
    _regular.text = f['price_regular'] == null ? '' : _num(J.n(f['price_regular']));
    _promo.text = f['price_promo'] == null ? '' : _num(J.n(f['price_promo']));
    _url.text = text(f['cta_url']);
    _priority.text = '${J.i(f['priority'])}';
    DateTime? day(dynamic v) {
      final s = text(v);
      return s.length < 10 ? null : DateTime.tryParse(s.substring(0, 10));
    }

    setState(() {
      if (campaignKinds.contains(f['kind'])) _kind = '${f['kind']}';
      if (campaignAudiences.contains(f['audience'])) _audience = '${f['audience']}';
      if (campaignCurrencies.contains(f['currency'])) _currency = '${f['currency']}';
      _classStarts = day(f['class_starts_on']);
      _classEnds = day(f['class_ends_on']);
      _startsAt = J.date(f['starts_at']) ?? DateTime.now();
      _endsAt = J.date(f['ends_at']);
      _showSeats = f['show_seats'] != false;
      _showCountdown = f['show_countdown'] != false;
      _bar = f['place_bar'] == true;
      _home = f['place_home'] != false;
      _flash = f['place_flash'] == true;
      _learn = f['place_learn'] != false;
      if (campaignThemes.any((t) => t.id == f['theme'])) _theme = '${f['theme']}';
      if (const ['form', 'link', 'none'].contains(f['registration_mode'])) _mode = '${f['registration_mode']}';
      // A picture the AI already made stays when the campaign is only changed.
      if (!(keepAiImage && isAiImage(_image))) _image = text(f['image_key']).isEmpty ? null : text(f['image_key']);
      _error = null;
    });
  }

  void _applyDraft(Map<String, dynamic> fields, String imagePrompt) {
    _beforeAi ??= _body();
    _imagePrompt = imagePrompt;
    _apply(fields);
  }

  void _undoAi() {
    final before = _beforeAi;
    if (before == null) return;
    _apply(before, keepAiImage: false);
    setState(() => _beforeAi = null);
  }

  /// What is wrong before anything is sent, in the words of the server.
  String? _check(bool fr) {
    if (_text(_words['title_fr']!) == null && _text(_words['title_en']!) == null) {
      return fr ? 'Donnez un titre à la campagne, en français ou en anglais.' : 'Give the campaign a title, in French or in English.';
    }
    final seats = _seats.text.trim();
    if (seats.isNotEmpty) {
      final n = int.tryParse(seats);
      if (n == null || n < 1 || n > 100000) {
        return fr
            ? 'Le nombre de places est un nombre entier au-dessus de zéro (ou vide : sans limite).'
            : 'The number of seats is a whole number above zero (or empty: no limit).';
      }
    }
    for (final c in [_regular, _promo]) {
      if (c.text.trim().isNotEmpty && (_money(c) == null || _money(c)! < 0)) return fr ? 'Un prix est un nombre.' : 'A price must be a number.';
    }
    final r = _money(_regular), p = _money(_promo);
    if (r != null && p != null && p > r) {
      return fr ? 'Le prix de la campagne ne peut pas dépasser le prix normal.' : 'The campaign price cannot be higher than the regular price.';
    }
    if (_endsAt != null && !_endsAt!.isAfter(_startsAt)) return fr ? 'La campagne doit se terminer après son début.' : 'The campaign must end after it starts.';
    if (_classStarts != null && _classEnds != null && _classEnds!.isBefore(_classStarts!)) {
      return fr ? 'Le cours ne peut pas finir avant de commencer.' : 'The class cannot end before it starts.';
    }
    if (_mode == 'link' && !RegExp(r'^(https://|/)\S*$', caseSensitive: false).hasMatch(_url.text.trim())) {
      return fr
          ? 'Le lien du bouton commence par https:// (ou par / pour une page du site).'
          : 'The button link must start with https:// (or with / for a page of this site).';
    }
    return null;
  }

  Future<void> _save({bool publish = false}) async {
    final fr = context.isFrench;
    final problem = _check(fr);
    setState(() => _error = problem);
    if (problem != null) return;
    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      if (_editing) {
        await api.put('/admin/promotions/${_c!.id}', data: _body());
        if (!mounted) return;
        adminToast(context, fr ? 'Campagne enregistrée' : 'Campaign saved');
        Navigator.of(context).pop(true);
      } else {
        final res = await api.post('/admin/promotions', data: {..._body(), if (publish) 'status': 'published'});
        if (!mounted) return;
        final id = J.i(J.map(J.map(res.data)['promotion'])['id']);
        adminToast(
          context,
          publish
              ? (_startsAt.isAfter(DateTime.now())
                    ? (fr
                          ? 'Publiée : elle apparaîtra le ${AdminFmt.dateTime(context, _startsAt)}'
                          : 'Published: it will appear on ${AdminFmt.dateTime(context, _startsAt)}')
                    : (fr ? 'Publiée : elle est sur le site' : 'Published: it is on the site now'))
              : (fr ? 'Brouillon enregistré' : 'Draft saved'),
        );
        Navigator.of(context).pop(id);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _saving = false;
      });
    }
  }

  // ── Pickers ─────────────────────────────────────────────────────────────

  Future<DateTime?> _pickDay(DateTime? current) {
    final now = DateTime.now();
    return showDatePicker(context: context, initialDate: current ?? now, firstDate: DateTime(now.year - 2), lastDate: DateTime(now.year + 4));
  }

  Future<DateTime?> _pickMoment(DateTime? current) async {
    final day = await _pickDay(current);
    if (day == null || !mounted) return null;
    final base = current ?? DateTime(day.year, day.month, day.day, 9);
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(base));
    if (!mounted) return null;
    final t = time ?? TimeOfDay.fromDateTime(base);
    return DateTime(day.year, day.month, day.day, t.hour, t.minute);
  }

  Future<void> _pickPicture() async {
    final picked = await showAdminPanel<String>(
      context,
      tabletWidth: 640,
      builder: (_) => _PicturePicker(current: _image, theme: themeOf(_theme)),
    );
    if (picked == null || !mounted) return;
    setState(() => _image = picked.isEmpty ? null : picked);
  }

  // ── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final lang = _lang ?? (fr ? 'fr' : 'en');
    final other = lang == 'fr' ? 'en' : 'fr';
    final otherMissing = _text(_words['title_$other']!) == null;
    TextEditingController w(String f) => _words['${f}_$lang']!;
    final classLike = _kind == 'group_class' || _kind == 'event';
    final preview = Campaign({
      ..._body(),
      'slug': _c?.slug ?? 'preview',
      'state': 'live',
      'seats_taken': _c?.seatsTaken ?? 0,
      'seats_left': () {
        final limit = int.tryParse(_seats.text.trim());
        return limit == null ? null : (limit - (_c?.seatsTaken ?? 0)).clamp(0, limit);
      }(),
    });
    final tag = lang.toUpperCase();

    return AdminPanel(
      title: _editing ? (fr ? 'Modifier la campagne' : 'Edit the campaign') : (fr ? 'Nouvelle campagne' : 'New campaign'),
      subtitle: _editing
          ? _c!.title(fr)
          : (fr ? 'Elle apparaît sur le site aux dates choisies, une fois publiée.' : 'It appears on the site on the dates you choose, once published.'),
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop()),
        if (_editing)
          AdminButton(fr ? 'Enregistrer' : 'Save', key: const Key('campaign-save'), icon: Icons.check, busy: _saving, onPressed: () => _save())
        else ...[
          AdminButton(
            fr ? 'Brouillon' : 'Draft',
            key: const Key('campaign-save-draft'),
            icon: Icons.save_outlined,
            primary: false,
            onPressed: _saving ? null : () => _save(),
          ),
          AdminButton(
            fr ? 'Publier' : 'Publish',
            key: const Key('campaign-save-publish'),
            icon: Icons.rocket_launch_outlined,
            busy: _saving,
            onPressed: () => _save(publish: true),
          ),
        ],
      ],
      children: [
        // The AI writer: describe the campaign, it fills everything in both languages.
        CampaignAiCard(
          editing: _editing,
          current: _body,
          hasContent: _text(_words['title_fr']!) != null || _text(_words['title_en']!) != null,
          onDraft: _applyDraft,
          onPicture: (key) => setState(() => _image = key),
          onUndo: _beforeAi == null ? null : _undoAi,
        ),
        if (_error != null) MarketingBanner(icon: Icons.error_outline, color: AppColors.bad, title: fr ? 'À corriger' : 'To fix', text: _error!),

        // What it is.
        PanelSection(fr ? 'Type de campagne' : 'Kind of campaign'),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            for (final k in campaignKinds)
              ChoiceChip(
                key: Key('campaign-kind-$k'),
                avatar: Icon(kindIcon(k), size: 16, color: k == _kind ? AppColors.pureWhite : AppColors.adminAccent),
                label: Text(kindLabel(k, fr)),
                selected: k == _kind,
                showCheckmark: false,
                selectedColor: AppColors.adminAccent,
                backgroundColor: AppColors.pureWhite,
                side: BorderSide(color: k == _kind ? AppColors.adminAccent : AppColors.border),
                labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: k == _kind ? AppColors.pureWhite : AppColors.text),
                onSelected: (_) => setState(() => _kind = k),
              ),
          ],
        ),
        _Hint(kindHint(_kind, fr)),

        // Its words.
        PanelSection(
          fr ? 'Textes ($tag)' : 'Words ($tag)',
          trailing: SegmentedButton<String>(
            key: const Key('campaign-lang'),
            segments: const [
              ButtonSegment(value: 'fr', label: Text('FR')),
              ButtonSegment(value: 'en', label: Text('EN')),
            ],
            selected: {lang},
            showSelectedIcon: false,
            style: const ButtonStyle(visualDensity: VisualDensity.compact, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
            onSelectionChanged: (s) => setState(() => _lang = s.first),
          ),
        ),
        if (otherMissing)
          _Hint(
            fr
                ? 'Pensez à l’autre langue (${other.toUpperCase()}) : sans elle, ses visiteurs voient ces textes-ci.'
                : 'Remember the other language (${other.toUpperCase()}): without it, its visitors see these words.',
          ),
        const SizedBox(height: 6),
        AdminField(
          key: Key('campaign-title-$lang'),
          label: fr ? 'Titre' : 'Title',
          hint: fr ? 'Groupe TCF Canada – janvier' : 'TCF Canada group – January',
          controller: w('title'),
        ),
        AdminField(label: fr ? 'Accroche (une phrase)' : 'Tagline (one sentence)', controller: w('tagline')),
        AdminField(label: fr ? 'Description' : 'Description', controller: w('description'), maxLines: 4),
        AdminField(
          label: fr ? 'Points forts (un par ligne, 6 au plus)' : 'Highlights (one per line, 6 at most)',
          hint: fr ? '8 personnes au plus\nProfesseur natif\nReplay de chaque cours' : '8 people at most\nNative teacher\nReplay of each class',
          controller: w('highlights'),
          maxLines: 4,
        ),
        LayoutBuilder(
          builder: (context, box) {
            final badge = AdminField(label: fr ? 'Badge (ex. « -20 % »)' : 'Badge (e.g. “-20%”)', controller: w('badge'));
            final cta = AdminField(label: fr ? 'Texte du bouton' : 'Button text', hint: campaignCta(preview, lang == 'fr'), controller: w('cta'));
            if (box.maxWidth < 420) return Column(children: [badge, cta]);
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: badge),
                const SizedBox(width: 10),
                Expanded(child: cta),
              ],
            );
          },
        ),
        if (classLike)
          AdminField(
            label: fr ? 'Horaire' : 'Timetable',
            hint: fr ? 'Mardi et jeudi, 18 h – 19 h 30 (heure de Montréal)' : 'Tuesday and Thursday, 6–7:30 pm (Montreal time)',
            controller: w('schedule'),
          ),
        if (_kind != 'announcement')
          AdminField(label: fr ? 'Note sous le prix' : 'Note under the price', hint: fr ? 'pour 8 semaines' : 'for 8 weeks', controller: w('price_note')),

        // Who it is for, and the class.
        PanelSection(classLike ? (fr ? 'Public et cours' : 'Audience and class') : (fr ? 'Public' : 'Audience')),
        AdminSelect<String>(
          label: fr ? 'Pour qui' : 'For whom',
          value: _audience,
          options: [for (final a in campaignAudiences) FilterOption(a, audienceLabel(a, fr))],
          onChanged: (v) => setState(() => _audience = v ?? 'general'),
        ),
        _Hint(
          fr
              ? 'Dans les cours gratuits, le site montre en priorité la campagne qui correspond à ce que la personne étudie.'
              : 'In the free courses, the site shows first the campaign that matches what the person studies.',
        ),
        const SizedBox(height: 8),
        AdminField(label: fr ? 'Niveau (facultatif)' : 'Level (optional)', hint: 'A2 – B1', controller: _level),
        if (classLike) ...[
          Row(
            children: [
              Expanded(
                child: _PickBox(
                  key: const Key('campaign-class-start'),
                  label: fr ? 'Début du cours' : 'Class starts',
                  value: _classStarts == null ? '—' : AdminFmt.day(context, _classStarts),
                  onTap: () async {
                    final d = await _pickDay(_classStarts);
                    if (d != null) setState(() => _classStarts = d);
                  },
                  onClear: _classStarts == null ? null : () => setState(() => _classStarts = null),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _PickBox(
                  label: fr ? 'Fin du cours' : 'Class ends',
                  value: _classEnds == null ? '—' : AdminFmt.day(context, _classEnds),
                  onTap: () async {
                    final d = await _pickDay(_classEnds ?? _classStarts);
                    if (d != null) setState(() => _classEnds = d);
                  },
                  onClear: _classEnds == null ? null : () => setState(() => _classEnds = null),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          AdminField(label: fr ? 'Professeur (facultatif)' : 'Teacher (optional)', controller: _teacher),
          AdminField(
            key: const Key('campaign-seats'),
            label: fr ? 'Nombre de places (vide : sans limite)' : 'Number of seats (empty: no limit)',
            controller: _seats,
            keyboardType: TextInputType.number,
          ),
          _Switch(
            label: fr ? 'Afficher les places restantes' : 'Show the seats left',
            hint: fr
                ? '« Plus que 3 places » pousse à s’inscrire. Complet : les suivants vont sur la liste d’attente.'
                : '“Only 3 seats left” makes people act. When full, the next ones join the waiting list.',
            value: _showSeats,
            onChanged: (v) => setState(() => _showSeats = v),
          ),
        ],

        // The price.
        if (_kind != 'announcement') ...[
          PanelSection(fr ? 'Prix' : 'Price'),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: AdminField(
                  label: fr ? 'Prix normal' : 'Regular price',
                  controller: _regular,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AdminField(
                  label: fr ? 'Prix de la campagne' : 'Campaign price',
                  controller: _promo,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                ),
              ),
            ],
          ),
          AdminSelect<String>(
            label: fr ? 'Devise' : 'Currency',
            value: _currency,
            options: [for (final c in campaignCurrencies) FilterOption(c, c)],
            onChanged: (v) => setState(() => _currency = v ?? 'CAD'),
          ),
          _Hint(
            fr
                ? 'Laissez vide pour ne pas afficher de prix. 0 affiche « Gratuit ». Le prix normal s’affiche barré à côté du prix de la campagne.'
                : 'Leave empty to show no price. 0 shows “Free”. The regular price shows struck through beside the campaign price.',
          ),
        ],

        // When and where.
        PanelSection(fr ? 'Sur le site' : 'On the site'),
        LayoutBuilder(
          builder: (context, box) {
            final from = _PickBox(
              key: const Key('campaign-starts'),
              label: fr ? 'À partir du' : 'From',
              value: AdminFmt.dateTime(context, _startsAt),
              onTap: () async {
                final d = await _pickMoment(_startsAt);
                if (d != null) setState(() => _startsAt = d);
              },
            );
            final until = _PickBox(
              key: const Key('campaign-ends'),
              label: fr ? 'Jusqu’au' : 'Until',
              value: _endsAt == null ? (fr ? 'Sans fin' : 'No end') : AdminFmt.dateTime(context, _endsAt),
              onTap: () async {
                final d = await _pickMoment(_endsAt ?? _endOfDay(_startsAt.add(const Duration(days: 21))));
                if (d != null) setState(() => _endsAt = d);
              },
              onClear: _endsAt == null ? null : () => setState(() => _endsAt = null),
            );
            // Date and time side by side only when both fit whole.
            if (box.maxWidth < 460) return Column(children: [from, const SizedBox(height: 12), until]);
            return Row(
              children: [
                Expanded(child: from),
                const SizedBox(width: 10),
                Expanded(child: until),
              ],
            );
          },
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 6,
          children: [
            for (final (days, label) in [(7, fr ? '1 semaine' : '1 week'), (21, fr ? '3 semaines' : '3 weeks'), (42, fr ? '6 semaines' : '6 weeks')])
              _QuickChip(label, onTap: () => setState(() => _endsAt = _endOfDay(_startsAt.add(Duration(days: days))))),
            if (_classStarts != null && _classStarts!.isAfter(_startsAt))
              _QuickChip(
                fr ? 'Jusqu’au début du cours' : 'Until the class starts',
                onTap: () =>
                    setState(() => _endsAt = DateTime(_classStarts!.year, _classStarts!.month, _classStarts!.day).subtract(const Duration(minutes: 1))),
              ),
          ],
        ),
        const SizedBox(height: 6),
        _Switch(
          label: fr ? 'Compte à rebours' : 'Countdown',
          hint: fr ? 'Affiche le temps restant jusqu’à la fin : l’urgence fait agir.' : 'Shows the time left until the end: urgency makes people act.',
          value: _showCountdown,
          onChanged: (v) => setState(() => _showCountdown = v),
        ),
        _Hint(
          fr
              ? 'Elle est toujours sur la page des offres. Choisissez où elle apparaît en plus :'
              : 'It is always on the offers page. Choose where else it appears:',
        ),
        _Switch(
          key: const Key('campaign-place-bar'),
          icon: placeIcon('bar'),
          label: fr ? 'Bandeau en haut des pages' : 'Bar at the top of the pages',
          hint: fr
              ? 'Une ligne au-dessus du menu ; une seule campagne à la fois (la plus prioritaire).'
              : 'One line above the menu; one campaign at a time (the highest priority).',
          value: _bar,
          onChanged: (v) => setState(() => _bar = v),
        ),
        _Switch(
          icon: placeIcon('home'),
          label: fr ? 'Page d’accueil' : 'Home page',
          hint: fr ? 'La section « Groupes et offres du moment ».' : 'The “Upcoming groups and current offers” section.',
          value: _home,
          onChanged: (v) => setState(() => _home = v),
        ),
        _Switch(
          icon: placeIcon('flash'),
          label: fr ? 'Flash' : 'Flash pop-up',
          hint: fr
              ? 'Une fenêtre discrète qui s’ouvre après quelques secondes, une fois par visite.'
              : 'A discreet window that opens after a few seconds, once per visit.',
          value: _flash,
          onChanged: (v) => setState(() => _flash = v),
        ),
        _Switch(
          icon: placeIcon('learn'),
          label: fr ? 'Cours gratuits' : 'Free courses',
          hint: fr
              ? '« Ce cours vous plaît ? » pendant et à la fin des leçons et des jeux gratuits.'
              : '“Enjoying this course?” during and at the end of the free lessons and games.',
          value: _learn,
          onChanged: (v) => setState(() => _learn = v),
        ),
        const SizedBox(height: 6),
        AdminField(
          label: fr ? 'Priorité (-100 à 100)' : 'Priority (-100 to 100)',
          hint: fr ? 'La plus haute passe en premier' : 'The highest comes first',
          controller: _priority,
          keyboardType: const TextInputType.numberWithOptions(signed: true),
        ),

        // The look.
        PanelSection(fr ? 'Apparence' : 'Look'),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            for (final t in campaignThemes)
              Tooltip(
                message: t.name(fr),
                child: InkWell(
                  key: Key('campaign-theme-${t.id}'),
                  customBorder: const CircleBorder(),
                  onTap: () => setState(() => _theme = t.id),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      gradient: t.gradient,
                      shape: BoxShape.circle,
                      border: Border.all(color: t.id == _theme ? AppColors.ink : AppColors.pureWhite, width: 3),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 4)],
                    ),
                    child: t.id == _theme ? Icon(Icons.check, color: t.accent, size: 20) : null,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 96,
                height: 56,
                child: CampaignPicture(imageKey: _image, theme: themeOf(_theme)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  AdminButton(
                    _image == null ? (fr ? 'Choisir une image' : 'Choose a picture') : (fr ? 'Changer' : 'Change'),
                    key: const Key('campaign-picture'),
                    icon: Icons.photo_library_outlined,
                    primary: false,
                    onPressed: _pickPicture,
                  ),
                  if (_image != null) AdminLink(fr ? 'Sans image' : 'No picture', onTap: () => setState(() => _image = null)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        AiPictureMaker(
          prompt: _imagePrompt,
          theme: _theme,
          title: _text(_words['title_en']!) ?? _text(_words['title_fr']!),
          onPicture: (key) => setState(() => _image = key),
        ),
        if (isAiImage(_image))
          _Hint(fr ? 'Cette image a été créée par l’IA pour cette campagne.' : 'This picture was made by the AI for this campaign.'),

        // How people register.
        PanelSection(fr ? 'Inscription' : 'Registration'),
        AdminSelect<String>(
          label: fr ? 'Le bouton' : 'The button',
          value: _mode,
          options: [
            FilterOption('form', fr ? 'Ouvre le formulaire d’inscription' : 'Opens the registration form'),
            FilterOption('link', fr ? 'Mène à un autre lien' : 'Leads to another link'),
            FilterOption('none', fr ? 'Pas de bouton (simple annonce)' : 'No button (an announcement only)'),
          ],
          onChanged: (v) => setState(() => _mode = v ?? 'form'),
        ),
        if (_mode == 'form')
          _Hint(
            fr
                ? 'Chaque inscription arrive ici, avec ses coordonnées ; la personne reçoit un e-mail de confirmation.'
                : 'Each registration arrives here with the person’s details; they receive a confirmation email.',
          ),
        if (_mode == 'link')
          AdminField(
            key: const Key('campaign-url'),
            label: fr ? 'Lien du bouton' : 'Button link',
            hint: 'https://…',
            controller: _url,
            keyboardType: TextInputType.url,
          ),

        // As visitors will see it.
        PanelSection(fr ? 'Aperçu ($tag)' : 'Preview ($tag)'),
        CampaignPreview(campaign: preview, fr: lang == 'fr'),
      ],
    );
  }
}

/// The pictures of the site, by theme. Pops the chosen key ('' for none).
class _PicturePicker extends StatelessWidget {
  final String? current;
  final CampaignTheme theme;
  const _PicturePicker({required this.current, required this.theme});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return AdminPanel(
      title: fr ? 'Image de la campagne' : 'Campaign picture',
      subtitle: fr ? 'Les images du site, en haute qualité.' : 'The pictures of the site, in high quality.',
      children: [
        for (final (en, frName, keys) in campaignPictures) ...[
          PanelSection(fr ? frName : en),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final k in keys)
                InkWell(
                  key: Key('picture-$k'),
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => Navigator.of(context).pop(k),
                  child: Container(
                    width: 104,
                    height: 62,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: k == current ? AppColors.adminAccent : AppColors.border, width: k == current ? 3 : 1),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: CampaignPicture(imageKey: k, theme: theme),
                  ),
                ),
            ],
          ),
        ],
        const SizedBox(height: 16),
        AdminButton(fr ? 'Sans image' : 'No picture', icon: Icons.hide_image_outlined, primary: false, onPressed: () => Navigator.of(context).pop('')),
      ],
    );
  }
}

class _PickBox extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;
  final VoidCallback? onClear;
  const _PickBox({super.key, required this.label, required this.value, required this.onTap, this.onClear});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: InputDecorator(
        decoration: adminInputDecoration(
          label,
          suffix: onClear == null
              ? const Icon(Icons.calendar_today_outlined, size: 18)
              : IconButton(tooltip: context.isFrench ? 'Effacer' : 'Clear', icon: const Icon(Icons.close, size: 18), onPressed: onClear),
        ),
        child: Text(value, style: AppTypography.bodyMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
      ),
    );
  }
}

class _Switch extends StatelessWidget {
  final String label;
  final String? hint;
  final IconData? icon;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _Switch({super.key, required this.label, this.hint, this.icon, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SwitchListTile.adaptive(
      contentPadding: EdgeInsets.zero,
      dense: true,
      value: value,
      onChanged: onChanged,
      activeTrackColor: AppColors.adminAccent,
      secondary: icon == null ? null : Icon(icon, color: value ? AppColors.adminAccent : AppColors.textSubtle, size: 22),
      title: Text(
        label,
        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
      ),
      subtitle: hint == null ? null : Text(hint!, style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.35)),
    );
  }
}

class _QuickChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _QuickChip(this.label, {required this.onTap});

  @override
  Widget build(BuildContext context) => ActionChip(
    label: Text(label),
    onPressed: onTap,
    labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.adminAccent),
    backgroundColor: AppColors.pureWhite,
    side: const BorderSide(color: AppColors.border),
    visualDensity: VisualDensity.compact,
  );
}

class _Hint extends StatelessWidget {
  final String text;
  const _Hint(this.text);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 4, bottom: 4),
    child: Text(text, style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4)),
  );
}
