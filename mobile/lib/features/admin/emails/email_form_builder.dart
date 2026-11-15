import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'email_model.dart';

/// One question of the form, as the editor changes it (its words in both
/// languages live in text fields).
class FormQuestion {
  String id;
  String type;
  bool required;
  final TextEditingController labelFr;
  final TextEditingController labelEn;
  final TextEditingController optionsFr;
  final TextEditingController optionsEn;
  final Key key = UniqueKey();

  FormQuestion._(this.id, this.type, this.required, this.labelFr, this.labelEn, this.optionsFr, this.optionsEn);

  factory FormQuestion.from(Map<String, dynamic> raw) {
    final f = formFieldCopy(raw);
    List<String> list(String k) => f[k] is List ? (f[k] as List).map((e) => '$e').toList() : <String>[];
    return FormQuestion._(
      J.s(f['id']),
      J.s(f['type']),
      f['required'] == true,
      TextEditingController(text: J.s(f['label_fr'])),
      TextEditingController(text: J.s(f['label_en'])),
      TextEditingController(text: list('options_fr').join('\n')),
      TextEditingController(text: list('options_en').join('\n')),
    );
  }

  bool get hasChoices => emailChoiceTypes.contains(type);

  List<String> _lines(TextEditingController c) => c.text.split('\n').map((e) => e.trim()).where((e) => e.isNotEmpty).take(12).toList();

  /// The question as the API takes it.
  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'required': required,
    'label_fr': labelFr.text.trim().isEmpty ? null : labelFr.text.trim(),
    'label_en': labelEn.text.trim().isEmpty ? null : labelEn.text.trim(),
    if (hasChoices) 'options_fr': _lines(optionsFr),
    if (hasChoices) 'options_en': _lines(optionsEn),
  };

  List<TextEditingController> get controllers => [labelFr, labelEn, optionsFr, optionsEn];
  void dispose() {
    for (final c in controllers) {
      c.dispose();
    }
  }
}

/// The questions of the form: type, required or not, the words in French and
/// in English, the choices; move, remove, add (or a ready-made one).
class EmailFormBuilder extends StatelessWidget {
  final List<FormQuestion> questions;
  final VoidCallback onChanged;
  final ValueChanged<FormQuestion> onAdd;
  final ValueChanged<FormQuestion> onRemove;

  const EmailFormBuilder({super.key, required this.questions, required this.onChanged, required this.onAdd, required this.onRemove});

  static const max = 12;

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final existing = questions.map((q) => q.toJson()).toList();
    final ids = questions.map((q) => q.id).toSet();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < questions.length; i++) _question(context, fr, i),
        const SizedBox(height: 4),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            PopupMenuButton<String>(
              key: const Key('email-form-add'),
              enabled: questions.length < max,
              tooltip: fr ? 'Ajouter une question' : 'Add a question',
              onSelected: (t) => onAdd(FormQuestion.from(newFormField(t, existing))),
              itemBuilder: (_) => [for (final t in emailFieldTypes) PopupMenuItem(value: t, child: Text(fieldTypeLabel(t, fr)))],
              child: Chip(
                avatar: const Icon(Icons.add, size: 18, color: AppColors.adminAccent),
                label: Text(fr ? 'Ajouter une question' : 'Add a question'),
                side: const BorderSide(color: AppColors.adminAccent),
                backgroundColor: AppColors.pureWhite,
              ),
            ),
            for (final (label, field) in formTemplates(fr))
              ActionChip(
                key: Key('email-form-template-${field['id']}'),
                label: Text(label),
                visualDensity: VisualDensity.compact,
                onPressed: ids.contains(field['id']) || questions.length >= max ? null : () => onAdd(FormQuestion.from(field)),
              ),
          ],
        ),
        if (!questions.any((q) => q.type == 'email'))
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              fr ? 'Gardez une question « Email » : c’est ainsi que vous répondez.' : 'Keep an « Email » question: it is how you answer people.',
              style: AppTypography.caption.copyWith(color: AppColors.warn, fontWeight: FontWeight.w700),
            ),
          ),
      ],
    );
  }

  Widget _question(BuildContext context, bool fr, int i) {
    final q = questions[i];
    void move(int d) {
      final j = i + d;
      if (j < 0 || j >= questions.length) return;
      final tmp = questions[i];
      questions[i] = questions[j];
      questions[j] = tmp;
      onChanged();
    }

    return Container(
      key: q.key,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(12, 8, 6, 4),
      decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 12,
                backgroundColor: AppColors.adminAccent.withValues(alpha: 0.1),
                child: Text('${i + 1}', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.adminAccent)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButton<String>(
                  key: Key('email-form-type-$i'),
                  value: q.type,
                  isExpanded: true,
                  isDense: true,
                  underline: const SizedBox.shrink(),
                  items: [for (final t in emailFieldTypes) DropdownMenuItem(value: t, child: Text(fieldTypeLabel(t, fr), overflow: TextOverflow.ellipsis))],
                  onChanged: (t) {
                    if (t == null) return;
                    q.type = t;
                    if (t == 'name' || t == 'email') q.required = true;
                    onChanged();
                  },
                ),
              ),
              IconButton(
                tooltip: fr ? 'Monter' : 'Up',
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.arrow_upward, size: 18),
                onPressed: i == 0 ? null : () => move(-1),
              ),
              IconButton(
                tooltip: fr ? 'Descendre' : 'Down',
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.arrow_downward, size: 18),
                onPressed: i == questions.length - 1 ? null : () => move(1),
              ),
              IconButton(
                key: Key('email-form-remove-$i'),
                tooltip: fr ? 'Retirer' : 'Remove',
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.bad),
                onPressed: () => onRemove(q),
              ),
            ],
          ),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            dense: true,
            value: q.required,
            activeTrackColor: AppColors.adminAccent,
            title: Text(fr ? 'Obligatoire' : 'Required', style: AppTypography.bodySmall),
            onChanged: (v) {
              q.required = v;
              onChanged();
            },
          ),
          AdminField(key: Key('email-form-label-fr-$i'), label: fr ? 'Question en français' : 'Question in French', controller: q.labelFr),
          AdminField(key: Key('email-form-label-en-$i'), label: fr ? 'Question en anglais' : 'Question in English', controller: q.labelEn),
          if (q.hasChoices) ...[
            AdminField(label: fr ? 'Choix en français (un par ligne)' : 'Choices in French (one per line)', controller: q.optionsFr, maxLines: 4),
            AdminField(label: fr ? 'Choix en anglais (même ordre)' : 'Choices in English (same order)', controller: q.optionsEn, maxLines: 4),
          ],
        ],
      ),
    );
  }
}
