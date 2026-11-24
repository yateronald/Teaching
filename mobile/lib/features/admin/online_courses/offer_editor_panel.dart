import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'online_courses_model.dart';

/// Create or edit a raw billing offer row (mirrors OfferModal on the web).
class OfferEditorPanel extends ConsumerStatefulWidget {
  final OfferRow? offer;
  final List<String> currencies;
  final List<String> merchantCurrencies;

  const OfferEditorPanel({
    super.key,
    this.offer,
    required this.currencies,
    required this.merchantCurrencies,
  });

  @override
  ConsumerState<OfferEditorPanel> createState() => _OfferEditorPanelState();
}

class _OfferEditorPanelState extends ConsumerState<OfferEditorPanel> {
  OfferRow? get _o => widget.offer;
  final _formKey = GlobalKey<FormState>();

  late final _nameEn = TextEditingController(text: _o?.nameEn ?? '');
  late final _nameFr = TextEditingController(text: _o?.nameFr ?? '');
  late final _descEn = TextEditingController(text: _o?.descriptionEn ?? '');
  late final _descFr = TextEditingController(text: _o?.descriptionFr ?? '');
  late final _price = TextEditingController(
    text: _o == null ? '14.99' : OnlineFmt.inputPriceText(_o!.amount / 100.0, _o!.currency),
  );
  late final _days = TextEditingController(text: '${_o?.days ?? 30}');
  late final _discount = TextEditingController(text: '${_o?.discountPct ?? 0}');
  late final _code = TextEditingController(text: _o?.code ?? '');
  late final _sort = TextEditingController(text: '${_o?.sort ?? 0}');
  late final _planCode = TextEditingController(text: _o?.paystackPlanCode ?? '');

  late String _tier = _o?.planTier ?? 'premium';
  late String _period = _o?.billingPeriod ?? (_o == null ? 'monthly' : '');
  late String _currency = _initialCurrency();
  late bool _recurring = _o?.recurring ?? false;
  late bool _active = _o?.active ?? false;
  bool _saving = false;

  String _initialCurrency() {
    if (_o != null) return _o!.currency;
    if (widget.currencies.contains('USD') && widget.merchantCurrencies.contains('XOF')) return 'USD';
    if (widget.merchantCurrencies.isNotEmpty) return widget.merchantCurrencies.first;
    return widget.currencies.isNotEmpty ? widget.currencies.first : 'USD';
  }

  @override
  void dispose() {
    for (final c in [_nameEn, _nameFr, _descEn, _descFr, _price, _days, _discount, _code, _sort, _planCode]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    if (!_formKey.currentState!.validate()) return;
    final priceNum = double.tryParse(_price.text.trim().replaceAll(',', '.')) ?? 0;
    final body = {
      'name_en': _nameEn.text.trim(),
      'name_fr': _nameFr.text.trim(),
      'description_en': _descEn.text.trim().isEmpty ? null : _descEn.text.trim(),
      'description_fr': _descFr.text.trim().isEmpty ? null : _descFr.text.trim(),
      'plan_tier': _tier,
      'billing_period': _period.isEmpty ? null : _period,
      'amount': (priceNum * 100).round(),
      'currency': _currency,
      'days': int.tryParse(_days.text.trim()) ?? 30,
      'discount_pct': int.tryParse(_discount.text.trim()) ?? 0,
      'code': _code.text.trim(),
      'sort': int.tryParse(_sort.text.trim()) ?? 0,
      'recurring': _recurring,
      'paystack_plan_code': _recurring ? _planCode.text.trim() : null,
      'active': _active,
    };

    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      if (_o != null) {
        await api.put('/admin/learners/billing/offers/${_o!.id}', data: body);
      } else {
        await api.post('/admin/learners/billing/offers', data: body);
      }
      if (!mounted) return;
      adminToast(context, fr ? 'Offre enregistrée' : 'Offer row saved');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final canConvertUsd = !_recurring && _currency == 'USD' && widget.merchantCurrencies.contains('XOF');
    final currencyMismatch = widget.merchantCurrencies.isNotEmpty &&
        !widget.merchantCurrencies.contains(_currency) &&
        !canConvertUsd;

    return AdminPanel(
      title: _o != null ? (fr ? 'Modifier l’offre' : 'Edit offer row') : (fr ? 'Nouvelle offre' : 'New offer row'),
      actions: [
        AdminButton(
          fr ? 'Annuler' : 'Cancel',
          primary: false,
          onPressed: _saving ? null : () => Navigator.of(context).maybePop(),
        ),
        AdminButton(
          fr ? 'Enregistrer' : 'Save offer',
          icon: Icons.save_outlined,
          busy: _saving,
          onPressed: _save,
        ),
      ],
      children: [
        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (currencyMismatch) ...[
                Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.warnBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.warnBorder),
                  ),
                  child: Text(
                    fr
                        ? '$_currency n’est pas activé sur votre compte Paystack (activés : ${widget.merchantCurrencies.join(', ')}).'
                        : '$_currency is not currently enabled on your Paystack account (enabled: ${widget.merchantCurrencies.join(', ')}).',
                    style: AppTypography.caption.copyWith(color: const Color(0xFF92400E), fontWeight: FontWeight.w600),
                  ),
                ),
              ],
              AdminField(
                label: fr ? 'Nom (anglais) *' : 'Name (English) *',
                controller: _nameEn,
                hint: 'Premium — Monthly',
                validator: (v) => (v == null || v.trim().isEmpty) ? (fr ? 'Requis' : 'Required') : null,
              ),
              AdminField(
                label: fr ? 'Nom (français) *' : 'Name (French) *',
                controller: _nameFr,
                hint: 'Premium — Mensuel',
                validator: (v) => (v == null || v.trim().isEmpty) ? (fr ? 'Requis' : 'Required') : null,
              ),
              AdminField(label: fr ? 'Description (anglais)' : 'Short line (English)', controller: _descEn),
              AdminField(label: fr ? 'Description (français)' : 'Short line (French)', controller: _descFr),
              AdminSelect<String>(
                label: fr ? 'Niveau de forfait' : 'Plan Tier',
                value: _tier,
                options: [
                  FilterOption('standard', fr ? 'Standard (Cours seuls)' : 'Standard (Courses only)'),
                  FilterOption('premium', fr ? 'Premium (Cours + Examens & IA)' : 'Premium (Courses + Exams & AI)'),
                ],
                onChanged: (v) => setState(() => _tier = v ?? 'premium'),
              ),
              AdminSelect<String>(
                label: fr ? 'Période de facturation' : 'Billing Period',
                value: _period,
                options: [
                  FilterOption('', fr ? 'Aucune / personnalisée' : 'None / Custom'),
                  FilterOption('monthly', fr ? 'Mensuel' : 'Monthly'),
                  FilterOption('quarterly', fr ? 'Trimestriel' : 'Quarterly'),
                  FilterOption('yearly', fr ? 'Annuel' : 'Yearly'),
                ],
                onChanged: (v) => setState(() => _period = v ?? ''),
              ),
              Row(
                children: [
                  Expanded(
                    child: AdminField(
                      label: fr ? 'Prix *' : 'Price *',
                      controller: _price,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) {
                        final p = double.tryParse((v ?? '').trim().replaceAll(',', '.'));
                        if (p == null || p < 0.01) return fr ? 'Min 0.01' : 'Min 0.01';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AdminSelect<String>(
                      label: fr ? 'Devise' : 'Currency',
                      value: _currency,
                      options: [
                        for (final c in widget.currencies)
                          FilterOption(
                            c,
                            widget.merchantCurrencies.isEmpty
                                ? c
                                : widget.merchantCurrencies.contains(c)
                                    ? '$c (Paystack)'
                                    : (c == 'USD' && widget.merchantCurrencies.contains('XOF') ? 'USD (→ XOF)' : '$c (!)'),
                          ),
                      ],
                      onChanged: (v) => setState(() => _currency = v ?? _currency),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Expanded(
                    child: AdminField(
                      label: fr ? 'Durée (jours) *' : 'Duration (days) *',
                      controller: _days,
                      keyboardType: TextInputType.number,
                      validator: (v) {
                        final d = int.tryParse((v ?? '').trim());
                        if (d == null || d < 1 || d > 3660) return '1–3660';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AdminField(
                      label: fr ? 'Réduction (%)' : 'Discount (%)',
                      controller: _discount,
                      keyboardType: TextInputType.number,
                      validator: (v) {
                        final n = int.tryParse((v ?? '').trim());
                        if (n == null || n < 0 || n > 95) return '0–95';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: AdminField(
                      label: fr ? 'Code unique *' : 'Code *',
                      controller: _code,
                      hint: 'premium-monthly',
                      validator: (v) => RegExp(r'^[a-z0-9][a-z0-9-]{1,38}$').hasMatch((v ?? '').trim())
                          ? null
                          : (fr ? 'Lettres minuscules, chiffres et tirets' : 'Lowercase letters, digits & dashes'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AdminField(
                      label: fr ? 'Ordre' : 'Order',
                      controller: _sort,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: Text(fr ? 'Renouvellement automatique' : 'Renews automatically', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                value: _recurring,
                onChanged: (v) => setState(() => _recurring = v),
              ),
              if (_recurring)
                AdminField(
                  label: fr ? 'Code plan Paystack *' : 'Paystack plan code *',
                  controller: _planCode,
                  hint: 'PLN_...',
                  validator: (v) => !_recurring || RegExp(r'^PLN_[A-Za-z0-9]+$').hasMatch((v ?? '').trim())
                      ? null
                      : 'PLN_…',
                ),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: Text(fr ? 'Visible sur le site' : 'Active on site', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                value: _active,
                onChanged: (v) => setState(() => _active = v),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
