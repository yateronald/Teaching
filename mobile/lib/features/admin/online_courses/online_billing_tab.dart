import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'offer_editor_panel.dart';
import 'online_courses_model.dart';

/// Plans, Discounts & Paystack Payments studio inside [OnlineCoursesScreen].
class OnlineBillingTab extends ConsumerStatefulWidget {
  final String? learnMode;
  final int refreshSignal;

  const OnlineBillingTab({super.key, this.learnMode, this.refreshSignal = 0});

  @override
  ConsumerState<OnlineBillingTab> createState() => _OnlineBillingTabState();
}

class _OnlineBillingTabState extends ConsumerState<OnlineBillingTab> {
  static const _periods = [
    ('monthly', 'Monthly', 'Mensuel', 1, 30),
    ('quarterly', 'Quarterly', 'Trimestriel', 3, 90),
    ('yearly', 'Yearly', 'Annuel', 12, 365),
  ];

  BillingInfo? _info;
  PlanDraft _draft = PlanDraft.fromCatalog(null);
  String _savedJson = '';
  bool _loading = true;
  bool _savingPlans = false;
  String? _error;

  // Plan form text controllers
  late final _qDiscCtrl = TextEditingController();
  late final _yDiscCtrl = TextEditingController();
  late final _aiCreditsCtrl = TextEditingController();
  late final Map<String, TextEditingController> _priceCtrls = {
    for (final t in ['standard', 'premium'])
      for (final p in _periods) '${t}_${p.$1}': TextEditingController(),
  };
  late final Map<String, TextEditingController> _plnCtrls = {
    for (final t in ['standard', 'premium'])
      for (final p in _periods) '${t}_${p.$1}': TextEditingController(),
  };

  // Payments ledger state
  List<PaymentRow> _payments = [];
  PaymentsSummary? _summary;
  int _payTotal = 0;
  int _payPage = 1;
  bool _payLoading = true;
  String _payStatus = 'all';
  final _paySearchCtrl = TextEditingController();
  String _payQuery = '';
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  @override
  void didUpdateWidget(covariant OnlineBillingTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.refreshSignal != oldWidget.refreshSignal) {
      _loadAll();
    }
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _qDiscCtrl.dispose();
    _yDiscCtrl.dispose();
    _aiCreditsCtrl.dispose();
    _paySearchCtrl.dispose();
    for (final c in _priceCtrls.values) {
      c.dispose();
    }
    for (final c in _plnCtrls.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _loadAll() async {
    await Future.wait([_loadBilling(), _loadPayments(reset: true)]);
  }

  Future<void> _loadBilling() async {
    setState(() {
      _loading = _info == null;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/admin/learners/billing');
      if (!mounted) return;
      final info = BillingInfo.fromJson(J.map(res.data));
      final draft = PlanDraft.fromCatalog(info.catalog);
      setState(() {
        _info = info;
        _draft = draft;
        _savedJson = jsonEncode(draft.toPayload());
        _loading = false;
      });
      _syncAllControllers();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  Future<void> _loadPayments({bool reset = false}) async {
    final targetPage = reset ? 1 : _payPage;
    setState(() => _payLoading = true);
    try {
      final res = await ref.read(apiClientProvider).get(
        '/admin/learners/billing/payments',
        queryParameters: {
          'page': targetPage,
          'limit': 25,
          if (_payStatus != 'all') 'status': _payStatus,
          if (_payQuery.isNotEmpty) 'q': _payQuery,
        },
      );
      if (!mounted) return;
      final data = J.map(res.data);
      final incoming = J.list(data, ['rows']).map(PaymentRow.fromJson).toList();
      setState(() {
        _payments = reset ? incoming : [..._payments, ...incoming];
        _payTotal = J.i(data['total'] ?? incoming.length);
        _payPage = targetPage;
        _summary = data['summary'] is Map ? PaymentsSummary.fromJson(J.map(data['summary'])) : _summary;
        _payLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _payLoading = false);
      adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  void _syncAllControllers() {
    _qDiscCtrl.text = '${_draft.quarterlyDiscount}';
    _yDiscCtrl.text = '${_draft.yearlyDiscount}';
    _aiCreditsCtrl.text = '${_draft.premiumAiCredits}';
    for (final t in ['standard', 'premium']) {
      final tier = _draft.tier(t);
      for (final p in _periods) {
        final pd = tier.period(p.$1);
        _priceCtrls['${t}_${p.$1}']!.text = OnlineFmt.inputPriceText(pd.price, _draft.currency);
        _plnCtrls['${t}_${p.$1}']!.text = pd.paystackPlanCode;
      }
    }
  }

  void _onDiscountChanged(String period, String raw) {
    final parsed = int.tryParse(raw.trim());
    if (parsed == null) return;
    final pct = parsed.clamp(0, 80);
    final months = period == 'quarterly' ? 3 : 12;
    setState(() {
      if (period == 'quarterly') {
        _draft.quarterlyDiscount = pct;
      } else {
        _draft.yearlyDiscount = pct;
      }
      for (final t in ['standard', 'premium']) {
        final td = _draft.tier(t);
        final pd = td.period(period);
        pd.discountPct = pct;
        pd.price = OnlineFmt.discountedPrice(td.monthly.price, months, pct, _draft.currency);
        _priceCtrls['${t}_$period']!.text = OnlineFmt.inputPriceText(pd.price, _draft.currency);
      }
    });
  }

  void _recalculateAllFromDiscounts(bool fr) {
    setState(() {
      for (final t in ['standard', 'premium']) {
        final td = _draft.tier(t);
        final m = td.monthly.price;
        td.quarterly.discountPct = _draft.quarterlyDiscount;
        td.quarterly.price = OnlineFmt.discountedPrice(m, 3, _draft.quarterlyDiscount, _draft.currency);
        td.yearly.discountPct = _draft.yearlyDiscount;
        td.yearly.price = OnlineFmt.discountedPrice(m, 12, _draft.yearlyDiscount, _draft.currency);
        _priceCtrls['${t}_quarterly']!.text = OnlineFmt.inputPriceText(td.quarterly.price, _draft.currency);
        _priceCtrls['${t}_yearly']!.text = OnlineFmt.inputPriceText(td.yearly.price, _draft.currency);
      }
    });
    adminToast(
      context,
      fr ? 'Prix trimestriels et annuels recalculés' : 'Quarterly and yearly prices recalculated from %',
    );
  }

  void _onTierPriceChanged(String tierKey, String periodKey, String raw) {
    final parsed = double.tryParse(raw.trim().replaceAll(',', '.'));
    if (parsed == null || parsed < 0.01) return;
    setState(() {
      final td = _draft.tier(tierKey);
      if (periodKey == 'monthly') {
        final rounded = OnlineFmt.roundPrice(parsed, _draft.currency);
        td.monthly.price = rounded;
        td.monthly.discountPct = 0;
        td.quarterly.discountPct = _draft.quarterlyDiscount;
        td.quarterly.price = OnlineFmt.discountedPrice(rounded, 3, _draft.quarterlyDiscount, _draft.currency);
        td.yearly.discountPct = _draft.yearlyDiscount;
        td.yearly.price = OnlineFmt.discountedPrice(rounded, 12, _draft.yearlyDiscount, _draft.currency);
        _priceCtrls['${tierKey}_quarterly']!.text = OnlineFmt.inputPriceText(td.quarterly.price, _draft.currency);
        _priceCtrls['${tierKey}_yearly']!.text = OnlineFmt.inputPriceText(td.yearly.price, _draft.currency);
      } else {
        final months = periodKey == 'quarterly' ? 3 : 12;
        final baseline = td.monthly.price * months;
        final effPct = baseline > 0 ? ((1 - parsed / baseline) * 100).round().clamp(0, 95) : 0;
        final pd = td.period(periodKey);
        pd.price = OnlineFmt.roundPrice(parsed, _draft.currency);
        pd.discountPct = effPct;
      }
    });
  }

  Future<void> _savePlans() async {
    final fr = context.isFrench;
    setState(() => _savingPlans = true);
    try {
      final res = await ref.read(apiClientProvider).put('/admin/learners/billing/plans', data: _draft.toPayload());
      if (!mounted) return;
      final data = J.map(res.data);
      final updatedCat = data['catalog'] is Map ? PlanCatalog.fromJson(J.map(data['catalog'])) : _info!.catalog;
      final updatedOffers = data['offers'] is List ? J.list(data, ['offers']).map(OfferRow.fromJson).toList() : _info!.offers;
      final nextDraft = PlanDraft.fromCatalog(updatedCat);
      setState(() {
        _info = BillingInfo(
          mode: _info!.mode,
          learnMode: _info!.learnMode,
          callbackUrl: _info!.callbackUrl,
          webhookUrl: _info!.webhookUrl,
          currencies: _info!.currencies,
          merchantCurrencies: _info!.merchantCurrencies,
          fxUsdXofRate: _info!.fxUsdXofRate,
          fxSource: _info!.fxSource,
          catalog: updatedCat,
          offers: updatedOffers,
          statsPaid: _info!.statsPaid,
          statsReview: _info!.statsReview,
          statsSubscriptions: _info!.statsSubscriptions,
          statsProblems: _info!.statsProblems,
        );
        _draft = nextDraft;
        _savedJson = jsonEncode(nextDraft.toPayload());
      });
      _syncAllControllers();
      adminToast(context, fr ? 'Forfaits et tarifs enregistrés' : 'Subscription plans & discounts saved');
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _savingPlans = false);
    }
  }

  Future<void> _recheckPayment(PaymentRow p) async {
    final fr = context.isFrench;
    try {
      final res = await ref.read(apiClientProvider).post('/admin/learners/billing/payments/${p.id}/recheck', data: {});
      if (!mounted) return;
      final outcome = J.s(J.map(res.data)['outcome']);
      adminToast(context, fr ? 'Réponse Paystack : $outcome' : 'Paystack says: $outcome');
      await _loadPayments(reset: true);
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  Future<void> _openOfferEditor(OfferRow? offer) async {
    final info = _info;
    if (info == null) return;
    final saved = await showAdminPanel<bool>(
      context,
      tabletWidth: 560,
      builder: (_) => OfferEditorPanel(
        offer: offer,
        currencies: info.currencies,
        merchantCurrencies: info.merchantCurrencies,
      ),
    );
    if (saved == true && mounted) await _loadBilling();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading && _info == null) return const AdminLoading();
    if (_error != null && _info == null) return AdminError(message: _error!, onRetry: _loadBilling);

    final info = _info!;
    final isDirty = jsonEncode(_draft.toPayload()) != _savedJson;
    final effectiveMode = widget.learnMode ?? info.learnMode;
    final revenueText = (_summary?.revenue.isNotEmpty ?? false)
        ? _summary!.revenue.map((r) => OnlineFmt.money(r.amount, r.currency, fr)).join(' + ')
        : OnlineFmt.money(0, _draft.currency, fr);

    bool isAutoConverted(String currency, bool recurring) => !recurring && currency == 'USD' && info.canAutoConvertUsd;
    final unsupportedOffers = info.merchantCurrencies.isNotEmpty
        ? info.offers.where((o) => o.active && !info.merchantCurrencies.contains(o.currency) && !isAutoConverted(o.currency, o.recurring)).toList()
        : <OfferRow>[];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Billing KPI Strip
        AdminGrid(
          minTileWidth: 155,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(
              label: fr ? 'Revenus encaissés' : 'Collected revenue',
              value: revenueText,
              sub: fr ? '${info.statsPaid} paiement${info.statsPaid > 1 ? 's' : ''}' : '${info.statsPaid} paid checkout${info.statsPaid == 1 ? '' : 's'}',
              icon: Icons.payments_outlined,
              color: AppColors.good,
            ),
            StatTile(
              label: fr ? 'Abonnements actifs' : 'Active subscriptions',
              value: '${info.statsSubscriptions}',
              sub: 'Paystack: ${info.mode == 'live' ? (fr ? 'En ligne' : 'Live') : info.mode == 'test' ? (fr ? 'Test' : 'Test') : (fr ? 'Non configuré' : 'Off')}',
              icon: Icons.verified_outlined,
              color: const Color(0xFF4F46E5),
            ),
            StatTile(
              label: fr ? 'À vérifier' : 'Needs review',
              value: '${_summary?.review ?? info.statsReview}',
              sub: _summary != null
                  ? (fr ? '${_summary!.failed} échec${_summary!.failed > 1 ? 's' : ''}' : '${_summary!.failed} failed')
                  : (fr ? 'Appuyer pour filtrer' : 'Tap to filter'),
              icon: Icons.report_problem_outlined,
              color: (_summary?.review ?? info.statsReview) > 0 ? AppColors.warn : AppColors.textMuted,
              onTap: () {
                setState(() => _payStatus = _payStatus == 'review' ? 'all' : 'review');
                _loadPayments(reset: true);
              },
            ),
            StatTile(
              label: fr ? 'Webhooks (30 j)' : 'Webhooks (30d)',
              value: fr ? '${info.statsProblems} alerte${info.statsProblems > 1 ? 's' : ''}' : '${info.statsProblems} issue${info.statsProblems == 1 ? '' : 's'}',
              sub: info.merchantCurrencies.isNotEmpty
                  ? '${info.merchantCurrencies.join(', ')}${info.canAutoConvertUsd && info.fxUsdXofRate != null ? ' · 1 USD ≈ ${info.fxUsdXofRate!.round()} XOF' : ''}'
                  : (fr ? 'Devises en attente' : 'Currencies pending'),
              icon: Icons.hub_outlined,
              color: info.statsProblems > 0 ? AppColors.bad : const Color(0xFF2563EB),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // 2. Paystack Gateway Configuration Card
        AdminCard(
          title: 'Paystack Checkout Gateway',
          icon: Icons.hub_outlined,
          action: Pill(
            info.mode == 'live' ? 'Live' : info.mode == 'test' ? 'Test mode' : (fr ? 'Non configuré' : 'Not configured'),
            color: info.mode == 'live' ? AppColors.good : info.mode == 'test' ? AppColors.warn : AppColors.bad,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  for (final cur in info.merchantCurrencies) Pill('$cur ${fr ? 'règlement' : 'settlement'}', color: const Color(0xFF2563EB)),
                  if (info.canAutoConvertUsd && info.fxUsdXofRate != null)
                    Pill('USD → XOF (1 USD ≈ ${info.fxUsdXofRate!.toStringAsFixed(0)} XOF)', color: const Color(0xFF0891B2)),
                ],
              ),
              if (info.mode == 'off') ...[
                const SizedBox(height: 10),
                _NoticeBox(
                  color: AppColors.warn,
                  bg: AppColors.warnBg,
                  border: AppColors.warnBorder,
                  text: fr
                      ? 'Ajoutez PAYSTACK_SECRET_KEY dans backend/.env et redémarrez l’API pour activer le paiement en ligne.'
                      : 'Add PAYSTACK_SECRET_KEY to backend/.env and restart the API to enable online checkout.',
                ),
              ],
              const SizedBox(height: 10),
              _CopyUrlRow(
                label: fr ? 'URL de retour (Callback URL)' : 'Callback URL (Paystack → API Keys)',
                url: info.callbackUrl,
                emptyText: fr ? 'Configurer API_PUBLIC_URL sur le serveur' : 'Set API_PUBLIC_URL on the server',
              ),
              const SizedBox(height: 8),
              _CopyUrlRow(
                label: fr ? 'URL Webhook (Paystack)' : 'Webhook URL (Paystack → API Keys)',
                url: info.webhookUrl,
                emptyText: fr ? 'Configurer API_PUBLIC_URL sur le serveur' : 'Set API_PUBLIC_URL on the server',
              ),
              if (unsupportedOffers.isNotEmpty) ...[
                const SizedBox(height: 10),
                _NoticeBox(
                  color: AppColors.bad,
                  bg: AppColors.badBg,
                  border: AppColors.badBorder,
                  text: fr
                      ? 'Paystack refuse ${unsupportedOffers.map((o) => '${o.nameFr} (${o.currency})').join(', ')} : devise non activée (activées : ${info.merchantCurrencies.join(', ')}).'
                      : 'Paystack rejected ${unsupportedOffers.map((o) => '${o.nameEn} (${o.currency})').join(', ')}: currency not enabled (enabled: ${info.merchantCurrencies.join(', ')}).',
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 3. 3-Tier x 3-Period Subscription Plans & Discounts Configurator
        AdminCard(
          title: fr ? 'Forfaits et périodes de facturation' : 'Subscription Plans & Billing Periods',
          icon: Icons.workspace_premium_outlined,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  Pill(
                    effectiveMode == 'premium'
                        ? (fr ? 'Actif sur l’espace apprenant' : 'Live on learner portal')
                        : (fr ? 'Cours gratuits en ce moment' : 'Courses free right now'),
                    color: effectiveMode == 'premium' ? AppColors.good : const Color(0xFF2563EB),
                  ),
                  if (!info.catalog.configured)
                    Pill(fr ? 'Valeurs par défaut — Enregistrez pour publier' : 'Defaults — Save to publish', color: AppColors.warn),
                  if (isDirty) Pill(fr ? 'Modifications non enregistrées' : 'Unsaved changes', color: const Color(0xFFD97706)),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                fr
                    ? 'Configurez Gratuit, Standard (cours seuls) et Premium (cours + simulateur d’examen & crédits IA) en mensuel, trimestriel et annuel.'
                    : 'Configure Free, Standard (courses only), and Premium (courses + Exam Simulator & AI credits) across Monthly, Quarterly, and Yearly periods.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
              ),
              if (effectiveMode == 'free') ...[
                const SizedBox(height: 10),
                _NoticeBox(
                  color: const Color(0xFF1D4ED8),
                  bg: AppColors.adminAccentBg,
                  border: AppColors.adminAccentLine,
                  text: fr
                      ? 'Les cours sont actuellement en mode Gratuit pour tous. Vous pouvez déjà enregistrer les tarifs : ils s’afficheront dès que les forfaits payants seront activés.'
                      : 'Courses are currently in Free for everyone mode. You can save all 3 tiers & discounts now; they go live once Paid Plans is switched on.',
                ),
              ],
              const SizedBox(height: 14),

              // Global currency, quarterly discount %, yearly discount %, AI credits
              AdminGrid(
                minTileWidth: 150,
                maxColumns: 4,
                spacing: 10,
                children: [
                  AdminSelect<String>(
                    label: fr ? 'Devise d’affichage' : 'Display Currency',
                    value: _draft.currency,
                    options: [
                      for (final c in info.currencies)
                        FilterOption(
                          c,
                          c == 'USD' && info.canAutoConvertUsd ? 'USD (→ XOF)' : c,
                        ),
                    ],
                    onChanged: (v) {
                      if (v == null) return;
                      setState(() => _draft.currency = v);
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: TextFormField(
                      key: const Key('billing-q-disc'),
                      controller: _qDiscCtrl,
                      keyboardType: TextInputType.number,
                      style: AppTypography.bodyMedium,
                      decoration: adminInputDecoration(fr ? 'Réduc. Trimestre (%)' : 'Quarterly Disc. (%)', hint: '0–80'),
                      onChanged: (v) => _onDiscountChanged('quarterly', v),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: TextFormField(
                      key: const Key('billing-y-disc'),
                      controller: _yDiscCtrl,
                      keyboardType: TextInputType.number,
                      style: AppTypography.bodyMedium,
                      decoration: adminInputDecoration(fr ? 'Réduc. Annuelle (%)' : 'Yearly Disc. (%)', hint: '0–80'),
                      onChanged: (v) => _onDiscountChanged('yearly', v),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: TextFormField(
                      key: const Key('billing-ai-credits'),
                      controller: _aiCreditsCtrl,
                      keyboardType: TextInputType.number,
                      style: AppTypography.bodyMedium,
                      decoration: adminInputDecoration(fr ? 'Crédits IA / mois (EE/EO)' : 'AI Credits / mo (EE/EO)', hint: '30'),
                      onChanged: (v) {
                        final parsed = int.tryParse(v.trim());
                        if (parsed == null) return;
                        setState(() => _draft.premiumAiCredits = parsed.clamp(0, 9999));
                      },
                    ),
                  ),
                ],
              ),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  AdminButton(
                    fr ? 'Recalculer depuis %' : 'Recalculate from %',
                    icon: Icons.calculate_outlined,
                    primary: false,
                    onPressed: () => _recalculateAllFromDiscounts(fr),
                  ),
                  if (isDirty)
                    AdminButton(
                      fr ? 'Réinitialiser' : 'Reset',
                      icon: Icons.undo,
                      primary: false,
                      onPressed: () {
                        setState(() => _draft = PlanDraft.fromCatalog(info.catalog));
                        _syncAllControllers();
                      },
                    ),
                  AdminButton(
                    fr ? 'Enregistrer les forfaits' : 'Save Plans & Pricing',
                    key: const Key('billing-save-plans'),
                    icon: Icons.save_outlined,
                    busy: _savingPlans,
                    onPressed: _savePlans,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // 3 Plan Cards: Free, Standard, Premium
              AdminGrid(
                minTileWidth: 280,
                maxColumns: 3,
                spacing: 12,
                children: [
                  _FreePlanAdminCard(currency: _draft.currency, fr: fr),
                  for (final tierKey in ['standard', 'premium']) _buildPaidTierCard(info, tierKey, fr),
                ],
              ),
              const SizedBox(height: 14),

              // Advanced Paystack recurring plan codes
              ExpansionTile(
                tilePadding: EdgeInsets.zero,
                childrenPadding: const EdgeInsets.only(bottom: 10),
                title: Text(
                  fr ? 'Codes plans récurrents Paystack (auto-renouvellement)' : 'Recurring Paystack Plan Codes (Optional Auto-Renew)',
                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                ),
                children: [
                  Text(
                    fr
                        ? 'Laissez désactivé pour un paiement unique (recommandé avec conversion USD → XOF). Activez uniquement si vous avez créé un code PLN_ dans Paystack.'
                        : 'Leave off for one-time checkout (recommended for USD → auto XOF). Enable only with a matching PLN_ plan in Paystack.',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 10),
                  for (final tierKey in ['standard', 'premium']) ...[
                    Padding(
                      padding: const EdgeInsets.only(top: 6, bottom: 4),
                      child: Text(tierKey == 'premium' ? 'Premium' : 'Standard', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
                    ),
                    for (final p in _periods)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            SizedBox(width: 84, child: Text(fr ? p.$3 : p.$2, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600))),
                            Switch.adaptive(
                              value: _draft.tier(tierKey).period(p.$1).recurring,
                              onChanged: (v) => setState(() => _draft.tier(tierKey).period(p.$1).recurring = v),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: TextField(
                                controller: _plnCtrls['${tierKey}_${p.$1}'],
                                enabled: _draft.tier(tierKey).period(p.$1).recurring,
                                style: AppTypography.bodySmall,
                                decoration: adminInputDecoration('PLN_...'),
                                onChanged: (v) => setState(() => _draft.tier(tierKey).period(p.$1).paystackPlanCode = v),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ],
              ),

              // Advanced raw offer rows
              ExpansionTile(
                tilePadding: EdgeInsets.zero,
                childrenPadding: const EdgeInsets.only(bottom: 10),
                title: Text(
                  fr ? 'Toutes les lignes d’offres (${info.offers.length})' : 'All Offer Rows (${info.offers.length})',
                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                ),
                children: [
                  Align(
                    alignment: Alignment.centerRight,
                    child: AdminButton(
                      fr ? 'Nouvelle offre' : 'Add custom offer',
                      icon: Icons.add,
                      primary: false,
                      onPressed: () => _openOfferEditor(null),
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (info.offers.isEmpty)
                    AdminEmpty(icon: Icons.local_offer_outlined, title: fr ? 'Aucune offre enregistrée' : 'No offer rows saved yet')
                  else
                    for (final o in info.offers) ...[
                      Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceSoft,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(fr ? o.nameFr : o.nameEn, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                                  const SizedBox(height: 4),
                                  Wrap(
                                    spacing: 6,
                                    runSpacing: 4,
                                    children: [
                                      Pill(o.code, color: AppColors.textMuted),
                                      Pill(o.planTier == 'standard' ? 'Standard' : 'Premium', color: o.planTier == 'standard' ? const Color(0xFF2563EB) : AppColors.frenchGold),
                                      Pill('${OnlineFmt.money(o.amount, o.currency, fr)} / ${o.days}d', color: AppColors.good),
                                      Pill(o.active ? (fr ? 'Actif' : 'Active') : (fr ? 'Masqué' : 'Hidden'), color: o.active ? AppColors.good : AppColors.textMuted),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              tooltip: fr ? 'Modifier' : 'Edit',
                              icon: const Icon(Icons.edit_outlined, size: 19),
                              onPressed: () => _openOfferEditor(o),
                            ),
                          ],
                        ),
                      ),
                    ],
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 4. Payments & Invoices Ledger
        AdminCard(
          title: fr ? 'Paiements & factures' : 'Payments & Invoices',
          icon: Icons.receipt_long_outlined,
          action: IconButton(
            tooltip: fr ? 'Actualiser' : 'Refresh',
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: () => _loadAll(),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AdminSearchField(
                controller: _paySearchCtrl,
                hint: fr ? 'Nom, e-mail, facture ou référence' : 'Search learner, email, invoice or reference',
                onChanged: (v) {
                  _searchDebounce?.cancel();
                  _searchDebounce = Timer(const Duration(milliseconds: 260), () {
                    setState(() => _payQuery = v.trim());
                    _loadPayments(reset: true);
                  });
                },
              ),
              const SizedBox(height: 10),
              AdminFilterChips<String>(
                selected: _payStatus,
                options: [
                  FilterOption('all', fr ? 'Tous' : 'All', count: _summary?.all),
                  FilterOption('success', fr ? 'Payés' : 'Paid', count: _summary?.success),
                  FilterOption('review', fr ? 'À vérifier' : 'To review', count: _summary?.review),
                  FilterOption('failed', fr ? 'Échoués' : 'Failed', count: _summary?.failed),
                  FilterOption('refunded', fr ? 'Remboursés' : 'Refunded', count: _summary?.refunded),
                  FilterOption('initialized', fr ? 'En cours' : 'In progress', count: _summary?.initialized),
                ],
                onSelected: (v) {
                  setState(() => _payStatus = v);
                  _loadPayments(reset: true);
                },
              ),
              const SizedBox(height: 12),
              if (_payLoading && _payments.isEmpty)
                const AdminLoading()
              else if (_payments.isEmpty)
                AdminEmpty(
                  icon: Icons.credit_card_off_outlined,
                  title: fr ? 'Aucune transaction trouvée' : 'No transactions found',
                  message: (_payStatus != 'all' || _payQuery.isNotEmpty)
                      ? (fr ? 'Effacez le filtre ou la recherche.' : 'Try clearing the status filter or search query.')
                      : (fr ? 'Les paiements Paystack apparaîtront ici.' : 'Paystack checkouts will appear here once learners start checking out.'),
                )
              else ...[
                for (final p in _payments) _PaymentCard(payment: p, fr: fr, onRecheck: () => _recheckPayment(p)),
                if (_payments.length < _payTotal)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Center(
                      child: AdminButton(
                        fr ? 'Afficher plus (${_payments.length}/$_payTotal)' : 'Show more (${_payments.length}/$_payTotal)',
                        primary: false,
                        busy: _payLoading,
                        onPressed: () {
                          setState(() => _payPage += 1);
                          _loadPayments();
                        },
                      ),
                    ),
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaidTierCard(BillingInfo info, String tierKey, bool fr) {
    final isPremium = tierKey == 'premium';
    final td = _draft.tier(tierKey);
    final mPrice = td.monthly.price;
    final showAutoXof = _draft.currency == 'USD' && info.canAutoConvertUsd && info.fxUsdXofRate != null;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isPremium ? const Color(0xFFC7D2FE) : const Color(0xFFBFDBFE),
          width: isPremium ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          isPremium ? 'Premium' : 'Standard',
                          style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                        ),
                        Pill(
                          isPremium ? (fr ? 'Populaire' : 'Most Popular') : (fr ? 'Cours seuls' : 'Courses only'),
                          color: isPremium ? AppColors.frenchGold : const Color(0xFF2563EB),
                          icon: isPremium ? Icons.workspace_premium : null,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isPremium
                          ? (fr
                              ? 'Tous les cours + simulateur TCF/TEF, annales & ${_draft.premiumAiCredits} crédits IA/mois (EE/EO)'
                              : 'All courses + TCF/TEF Simulator, CO/CE past subjects & ${_draft.premiumAiCredits} AI credits/mo')
                          : (fr ? 'Accès complet aux 464+ cours, 407 ateliers, dictées & certificats' : 'Full access to 464+ courses, 407 practice labs & certificates'),
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  Switch.adaptive(
                    value: td.active,
                    onChanged: (v) => setState(() => td.active = v),
                  ),
                  Text(td.active ? (fr ? 'Visible' : 'Visible') : (fr ? 'Masqué' : 'Hidden'), style: AppTypography.caption.copyWith(fontSize: 10.5)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          for (final p in _periods) ...[
            Builder(builder: (context) {
              final periodKey = p.$1;
              final months = p.$4;
              final pd = td.period(periodKey);
              final perMonthSub = ((pd.price / months) * 100).round();
              final totalSub = (pd.price * 100).round();
              final baseline = mPrice * months;
              final livePct = months > 1 && baseline > 0 ? ((1 - pd.price / baseline) * 100).round().clamp(0, 99) : 0;
              final xofEst = showAutoXof ? OnlineFmt.approxXofSubunits(totalSub, info.fxUsdXofRate) : null;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSoft,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${fr ? p.$3 : p.$2} (${pd.days}${fr ? 'j' : 'd'})',
                            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                          ),
                        ),
                        Text(
                          months > 1 ? '${OnlineFmt.money(perMonthSub, _draft.currency, fr)}/${fr ? 'mois' : 'mo'}' : (fr ? 'Tarif de base' : 'Base rate'),
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                        ),
                        if (livePct > 0) ...[
                          const SizedBox(width: 6),
                          Pill('-$livePct%', color: AppColors.good),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      key: Key('price-$tierKey-$periodKey'),
                      controller: _priceCtrls['${tierKey}_$periodKey'],
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                      decoration: adminInputDecoration('${fr ? 'Prix' : 'Price'} (${_draft.currency})'),
                      onChanged: (v) => _onTierPriceChanged(tierKey, periodKey, v),
                    ),
                    if (xofEst != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${fr ? 'Paiement auto Paystack :' : 'Auto Paystack checkout:'} ~${OnlineFmt.money(xofEst, 'XOF', fr)}',
                        style: AppTypography.caption.copyWith(color: const Color(0xFF0E7490), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}

class _FreePlanAdminCard extends StatelessWidget {
  final String currency;
  final bool fr;
  const _FreePlanAdminCard({required this.currency, required this.fr});

  @override
  Widget build(BuildContext context) {
    final bullets = fr
        ? ['Leçons d’ouverture A1–C2 (Module 1)', 'Test de niveau CECRL adaptatif', 'Aperçu des ateliers d’écoute', 'Suivi de progression enregistré']
        : ['Starter lessons across A1–C2 (Module 1)', 'Adaptive CEFR level placement test', 'Sample practice & listening labs', 'Progress tracking synced to account'];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: [
              Text(fr ? 'Gratuit' : 'Free', style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
              Pill(fr ? 'Toujours gratuit' : 'Always Free', color: AppColors.good),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            fr ? 'Niveau découverte pour visiteurs et comptes gratuits.' : 'Starter tier for visitors & signed-in free accounts.',
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: 10),
          Text(
            '${OnlineFmt.money(0, currency, fr)} / ${fr ? 'mois' : 'month'}',
            style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
          ),
          const SizedBox(height: 10),
          for (final b in bullets)
            Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(top: 2),
                    child: Icon(Icons.check, size: 15, color: AppColors.good),
                  ),
                  const SizedBox(width: 6),
                  Expanded(child: Text(b, style: AppTypography.caption.copyWith(color: AppColors.text))),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final PaymentRow payment;
  final bool fr;
  final VoidCallback onRecheck;

  const _PaymentCard({required this.payment, required this.fr, required this.onRecheck});

  @override
  Widget build(BuildContext context) {
    final p = payment;
    final converted = p.displayCurrency != p.currency;
    final statusColor = OnlineFmt.paymentStatusColor(p.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              InitialsAvatar(p.learnerName, size: 36, color: const Color(0xFF4F46E5)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.learnerName, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text(p.email, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Pill(OnlineFmt.paymentStatusLabel(p.status, fr), color: statusColor),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(OnlineFmt.money(p.displayAmount, p.displayCurrency, fr), style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                    if (converted)
                      Text('${fr ? 'Réglé :' : 'Settled:'} ${OnlineFmt.money(p.amount, p.currency, fr)}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${p.offer.isNotEmpty ? p.offer : '—'}${p.renewal ? ' · renewal' : ''}',
                      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(AdminFmt.dateTime(context, p.paidAt ?? p.createdAt), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  ],
                ),
              ),
            ],
          ),
          if (p.invoiceNumber.isNotEmpty || p.statusDetail.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              [if (p.invoiceNumber.isNotEmpty) p.invoiceNumber, if (p.statusDetail.isNotEmpty) p.statusDetail].join(' · '),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: p.reference));
                    adminToast(context, fr ? 'Référence copiée' : 'Reference copied');
                  },
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.copy_outlined, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 5),
                      Flexible(
                        child: Text(
                          p.reference,
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontFamily: 'monospace'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (p.status == 'initialized' || p.status == 'review')
                AdminButton(
                  fr ? 'Vérifier Paystack' : 'Ask Paystack',
                  icon: Icons.sync,
                  primary: false,
                  onPressed: onRecheck,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CopyUrlRow extends StatelessWidget {
  final String label;
  final String url;
  final String emptyText;

  const _CopyUrlRow({required this.label, required this.url, required this.emptyText});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(
                  url.isNotEmpty ? url : emptyText,
                  style: AppTypography.caption.copyWith(color: url.isNotEmpty ? AppColors.ink : AppColors.textSubtle, fontFamily: url.isNotEmpty ? 'monospace' : null),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (url.isNotEmpty)
            IconButton(
              tooltip: fr ? 'Copier' : 'Copy',
              icon: const Icon(Icons.copy_outlined, size: 18),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: url));
                adminToast(context, fr ? 'URL copiée' : 'URL copied');
              },
            ),
        ],
      ),
    );
  }
}

class _NoticeBox extends StatelessWidget {
  final Color color;
  final Color bg;
  final Color border;
  final String text;

  const _NoticeBox({required this.color, required this.bg, required this.border, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10), border: Border.all(color: border)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, size: 17, color: color),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: AppTypography.caption.copyWith(color: color, fontWeight: FontWeight.w600, height: 1.4))),
        ],
      ),
    );
  }
}
