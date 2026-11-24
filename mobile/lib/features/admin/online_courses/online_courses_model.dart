import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../common/admin_kit.dart';

bool _flag(dynamic v) => v == true || v == 1 || v == 'true';

class LearnModeInfo {
  final String mode; // 'free' | 'premium'
  final DateTime? updatedAt;
  final String updatedBy;

  const LearnModeInfo({required this.mode, this.updatedAt, this.updatedBy = ''});

  bool get isFree => mode == 'free';

  factory LearnModeInfo.fromJson(Map<String, dynamic> m) => LearnModeInfo(
        mode: J.s(m['mode']) == 'premium' ? 'premium' : 'free',
        updatedAt: J.date(m['updated_at']),
        updatedBy: J.s(m['updated_by']),
      );
}

class OnlineStats {
  final int learners;
  final int totalPeople;
  final int portalPeople;
  final int newWeek;
  final int premiumPeople;
  final int standardPeople;
  final int premiumTierPeople;
  final int active7d;
  final int openRequests;

  const OnlineStats({
    required this.learners,
    required this.totalPeople,
    required this.portalPeople,
    required this.newWeek,
    required this.premiumPeople,
    required this.standardPeople,
    required this.premiumTierPeople,
    required this.active7d,
    required this.openRequests,
  });

  factory OnlineStats.fromJson(Map<String, dynamic> m) => OnlineStats(
        learners: J.i(m['learners']),
        totalPeople: J.i(m['total_people'] ?? m['learners']),
        portalPeople: J.i(m['portal_people']),
        newWeek: J.i(m['new_week']),
        premiumPeople: J.i(m['premium_people']),
        standardPeople: J.i(m['standard_people']),
        premiumTierPeople: J.i(m['premium_tier_people'] ?? m['premium_people']),
        active7d: J.i(m['active_7d'] ?? m['new_week']),
        openRequests: J.i(m['open_requests']),
      );
}

class LearnerRow {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final bool isActive;
  final DateTime? createdAt;
  final String signupSource;
  final bool emailVerified;
  final String learnAccess; // 'off' | 'free'
  final String country;
  final String whatsapp;
  final String frenchLevel;
  final bool googleLinked;
  final int? organizationId;
  final String organization;
  final String organizationAccess;
  final bool premium;
  final String premiumTier; // 'standard' | 'premium'
  final DateTime? premiumUntil;
  final String premiumSource;
  final bool premiumViaCompany;
  final int? requestId;
  final DateTime? requestedAt;
  final String requestMessage;
  final DateTime? lastSeenAt;

  const LearnerRow({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    required this.isActive,
    required this.createdAt,
    required this.signupSource,
    required this.emailVerified,
    required this.learnAccess,
    required this.country,
    required this.whatsapp,
    required this.frenchLevel,
    required this.googleLinked,
    required this.organizationId,
    required this.organization,
    required this.organizationAccess,
    required this.premium,
    required this.premiumTier,
    required this.premiumUntil,
    required this.premiumSource,
    required this.premiumViaCompany,
    required this.requestId,
    required this.requestedAt,
    required this.requestMessage,
    required this.lastSeenAt,
  });

  String get fullName {
    final full = '$firstName $lastName'.trim();
    return full.isNotEmpty ? full : email;
  }

  bool get hasWebsiteAccess =>
      role == 'learner' || learnAccess == 'free' || organizationAccess == 'free';

  factory LearnerRow.fromJson(Map<String, dynamic> m) => LearnerRow(
        id: J.i(m['id']),
        firstName: J.s(m['first_name']),
        lastName: J.s(m['last_name']),
        email: J.s(m['email']),
        role: J.s(m['role']).isEmpty ? 'learner' : J.s(m['role']),
        isActive: m['is_active'] == null ? true : _flag(m['is_active']),
        createdAt: J.date(m['created_at']),
        signupSource: J.s(m['signup_source']),
        emailVerified: _flag(m['email_verified']),
        learnAccess: J.s(m['learn_access']) == 'free' ? 'free' : 'off',
        country: J.s(m['country']),
        whatsapp: J.s(m['whatsapp']),
        frenchLevel: J.s(m['french_level']),
        googleLinked: _flag(m['google_linked']),
        organizationId: m['organization_id'] == null ? null : J.i(m['organization_id']),
        organization: J.s(m['organization']),
        organizationAccess: J.s(m['organization_access']),
        premium: _flag(m['premium']),
        premiumTier: J.s(m['premium_tier']) == 'standard' ? 'standard' : 'premium',
        premiumUntil: J.date(m['premium_until']),
        premiumSource: J.s(m['premium_source']),
        premiumViaCompany: _flag(m['premium_via_company']),
        requestId: m['request_id'] == null ? null : J.i(m['request_id']),
        requestedAt: J.date(m['requested_at']),
        requestMessage: J.s(m['request_message']),
        lastSeenAt: J.date(m['last_seen_at']),
      );
}

class LearnerLicense {
  final int id;
  final String tier;
  final String source;
  final DateTime? startsAt;
  final DateTime? endsAt;
  final String reason;
  final DateTime? createdAt;
  final DateTime? revokedAt;
  final String revokeReason;
  final bool viaCompany;
  final bool active;
  final String createdByName;

  const LearnerLicense({
    required this.id,
    required this.tier,
    required this.source,
    required this.startsAt,
    required this.endsAt,
    required this.reason,
    required this.createdAt,
    required this.revokedAt,
    required this.revokeReason,
    required this.viaCompany,
    required this.active,
    required this.createdByName,
  });

  factory LearnerLicense.fromJson(Map<String, dynamic> m) => LearnerLicense(
        id: J.i(m['id']),
        tier: J.s(m['tier']) == 'standard' ? 'standard' : 'premium',
        source: J.s(m['source']),
        startsAt: J.date(m['starts_at']),
        endsAt: J.date(m['ends_at']),
        reason: J.s(m['reason']),
        createdAt: J.date(m['created_at']),
        revokedAt: J.date(m['revoked_at']),
        revokeReason: J.s(m['revoke_reason']),
        viaCompany: _flag(m['via_company']),
        active: _flag(m['active']),
        createdByName: J.s(m['created_by_name']),
      );
}

class LearnerHistoryItem {
  final String action;
  final Map<String, dynamic> detail;
  final DateTime? createdAt;
  final String actorName;

  const LearnerHistoryItem({
    required this.action,
    required this.detail,
    required this.createdAt,
    required this.actorName,
  });

  factory LearnerHistoryItem.fromJson(Map<String, dynamic> m) => LearnerHistoryItem(
        action: J.s(m['action']),
        detail: J.map(m['detail']),
        createdAt: J.date(m['created_at']),
        actorName: J.s(m['actor_name']),
      );
}

class LearnerRequest {
  final int id;
  final String message;
  final String status;
  final DateTime? createdAt;

  const LearnerRequest({
    required this.id,
    required this.message,
    required this.status,
    required this.createdAt,
  });

  factory LearnerRequest.fromJson(Map<String, dynamic> m) => LearnerRequest(
        id: J.i(m['id']),
        message: J.s(m['message']),
        status: J.s(m['status']),
        createdAt: J.date(m['created_at']),
      );
}

class LearnerDetail {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final bool isActive;
  final DateTime? createdAt;
  final String signupSource;
  final bool emailVerified;
  final bool googleLinked;
  final String country;
  final String whatsapp;
  final String frenchLevel;
  final String lang;
  final bool marketingOptIn;
  final String learnAccess;
  final int? orgId;
  final String orgName;
  final String orgLearnAccess;

  final String accessLevel; // 'visitor' | 'free' | 'premium'
  final String accessPlan; // 'visitor' | 'free' | 'standard' | 'premium'
  final bool accessWebsite;
  final DateTime? accessUntil;
  final String accessVia;
  final String accessTier;

  final List<LearnerLicense> licenses;
  final List<LearnerHistoryItem> history;
  final List<LearnerRequest> requests;
  final int devices;
  final int lessonsOpened30d;

  const LearnerDetail({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    required this.isActive,
    required this.createdAt,
    required this.signupSource,
    required this.emailVerified,
    required this.googleLinked,
    required this.country,
    required this.whatsapp,
    required this.frenchLevel,
    required this.lang,
    required this.marketingOptIn,
    required this.learnAccess,
    required this.orgId,
    required this.orgName,
    required this.orgLearnAccess,
    required this.accessLevel,
    required this.accessPlan,
    required this.accessWebsite,
    required this.accessUntil,
    required this.accessVia,
    required this.accessTier,
    required this.licenses,
    required this.history,
    required this.requests,
    required this.devices,
    required this.lessonsOpened30d,
  });

  String get fullName {
    final full = '$firstName $lastName'.trim();
    return full.isNotEmpty ? full : email;
  }

  factory LearnerDetail.fromJson(Map<String, dynamic> m) {
    final u = J.map(m['user']);
    final org = J.map(u['organization']);
    final access = J.map(m['access']);
    final prem = J.map(access['premium']);
    final tier = J.s(access['plan']).isNotEmpty
        ? J.s(access['plan'])
        : (J.s(prem['tier']).isNotEmpty ? J.s(prem['tier']) : 'free');
    return LearnerDetail(
      id: J.i(u['id']),
      firstName: J.s(u['first_name']),
      lastName: J.s(u['last_name']),
      email: J.s(u['email']),
      role: J.s(u['role']).isEmpty ? 'learner' : J.s(u['role']),
      isActive: u['is_active'] == null ? true : _flag(u['is_active']),
      createdAt: J.date(u['created_at']),
      signupSource: J.s(u['signup_source']),
      emailVerified: _flag(u['email_verified']),
      googleLinked: _flag(u['google_linked']),
      country: J.s(u['country']),
      whatsapp: J.s(u['whatsapp']),
      frenchLevel: J.s(u['french_level']),
      lang: J.s(u['lang']),
      marketingOptIn: _flag(u['marketing_opt_in']),
      learnAccess: J.s(u['learn_access']) == 'free' ? 'free' : 'off',
      orgId: org['id'] == null ? null : J.i(org['id']),
      orgName: J.s(org['name']),
      orgLearnAccess: J.s(org['learn_access']),
      accessLevel: J.s(access['level']),
      accessPlan: tier,
      accessWebsite: _flag(access['website']),
      accessUntil: J.date(prem['until']),
      accessVia: J.s(prem['via']),
      accessTier: J.s(prem['tier']) == 'standard' ? 'standard' : 'premium',
      licenses: J.list(m['licenses']).map(LearnerLicense.fromJson).toList(),
      history: J.list(m['history']).map(LearnerHistoryItem.fromJson).toList(),
      requests: J.list(m['requests']).map(LearnerRequest.fromJson).toList(),
      devices: J.i(m['devices']),
      lessonsOpened30d: J.i(m['lessons_opened_30d']),
    );
  }
}

class OnlineCompanyRow {
  final int id;
  final String name;
  final String status;
  final String learnAccess; // 'off' | 'free'
  final int accounts;
  final bool premium;
  final String premiumTier; // 'standard' | 'premium'
  final DateTime? premiumUntil;

  const OnlineCompanyRow({
    required this.id,
    required this.name,
    required this.status,
    required this.learnAccess,
    required this.accounts,
    required this.premium,
    required this.premiumTier,
    required this.premiumUntil,
  });

  factory OnlineCompanyRow.fromJson(Map<String, dynamic> m) => OnlineCompanyRow(
        id: J.i(m['id']),
        name: J.s(m['name']),
        status: J.s(m['status']),
        learnAccess: J.s(m['learn_access']) == 'free' ? 'free' : 'off',
        accounts: J.i(m['accounts']),
        premium: _flag(m['premium']),
        premiumTier: J.s(m['premium_tier']) == 'standard' ? 'standard' : 'premium',
        premiumUntil: J.date(m['premium_until']),
      );
}

class PeriodCatalog {
  final String code;
  final int amount;
  final String currency;
  final int days;
  final int discountPct;
  final bool recurring;
  final bool active;
  final String paystackPlanCode;

  const PeriodCatalog({
    required this.code,
    required this.amount,
    required this.currency,
    required this.days,
    required this.discountPct,
    required this.recurring,
    required this.active,
    this.paystackPlanCode = '',
  });

  factory PeriodCatalog.fromJson(Map<String, dynamic> m, {required String fallbackCode, required int fallbackDays, required int fallbackAmount}) =>
      PeriodCatalog(
        code: J.s(m['code']).isEmpty ? fallbackCode : J.s(m['code']),
        amount: m['amount'] == null ? fallbackAmount : J.i(m['amount']),
        currency: J.s(m['currency']).isEmpty ? 'USD' : J.s(m['currency']),
        days: m['days'] == null ? fallbackDays : J.i(m['days']),
        discountPct: J.i(m['discount_pct']),
        recurring: _flag(m['recurring']),
        active: m['active'] == null ? true : _flag(m['active']),
        paystackPlanCode: J.s(m['paystack_plan_code']),
      );
}

class TierCatalog {
  final bool active;
  final PeriodCatalog monthly;
  final PeriodCatalog quarterly;
  final PeriodCatalog yearly;

  const TierCatalog({
    required this.active,
    required this.monthly,
    required this.quarterly,
    required this.yearly,
  });

  PeriodCatalog period(String key) => switch (key) {
        'quarterly' => quarterly,
        'yearly' => yearly,
        _ => monthly,
      };

  factory TierCatalog.fromJson(Map<String, dynamic> m, String tierKey) {
    final p = J.map(m['periods']);
    final std = tierKey == 'standard';
    return TierCatalog(
      active: m['active'] == null ? true : _flag(m['active']),
      monthly: PeriodCatalog.fromJson(J.map(p['monthly']), fallbackCode: '$tierKey-monthly', fallbackDays: 30, fallbackAmount: std ? 999 : 1499),
      quarterly: PeriodCatalog.fromJson(J.map(p['quarterly']), fallbackCode: '$tierKey-quarterly', fallbackDays: 90, fallbackAmount: std ? 2697 : 4047),
      yearly: PeriodCatalog.fromJson(J.map(p['yearly']), fallbackCode: '$tierKey-yearly', fallbackDays: 365, fallbackAmount: std ? 9590 : 14390),
    );
  }
}

class PlanCatalog {
  final bool configured;
  final String currency;
  final int quarterlyDiscount;
  final int yearlyDiscount;
  final int premiumAiCredits;
  final TierCatalog standard;
  final TierCatalog premium;

  const PlanCatalog({
    required this.configured,
    required this.currency,
    required this.quarterlyDiscount,
    required this.yearlyDiscount,
    required this.premiumAiCredits,
    required this.standard,
    required this.premium,
  });

  factory PlanCatalog.defaults() => PlanCatalog(
        configured: false,
        currency: 'USD',
        quarterlyDiscount: 10,
        yearlyDiscount: 20,
        premiumAiCredits: 30,
        standard: TierCatalog.fromJson(const {}, 'standard'),
        premium: TierCatalog.fromJson(const {}, 'premium'),
      );

  factory PlanCatalog.fromJson(Map<String, dynamic> m) {
    final disc = J.map(m['discounts']);
    final tiers = J.map(m['tiers']);
    return PlanCatalog(
      configured: _flag(m['configured']),
      currency: J.s(m['currency']).isEmpty ? 'USD' : J.s(m['currency']),
      quarterlyDiscount: m.containsKey('discounts') ? J.i(disc['quarterly']) : 10,
      yearlyDiscount: m.containsKey('discounts') ? J.i(disc['yearly']) : 20,
      premiumAiCredits: m['premium_ai_credits'] == null ? 30 : J.i(m['premium_ai_credits']),
      standard: TierCatalog.fromJson(J.map(tiers['standard']), 'standard'),
      premium: TierCatalog.fromJson(J.map(tiers['premium']), 'premium'),
    );
  }
}

class OfferRow {
  final int id;
  final String code;
  final String nameEn;
  final String nameFr;
  final String descriptionEn;
  final String descriptionFr;
  final String planTier;
  final String? billingPeriod;
  final int discountPct;
  final int days;
  final int amount;
  final String currency;
  final bool recurring;
  final String paystackPlanCode;
  final bool active;
  final int sort;

  const OfferRow({
    required this.id,
    required this.code,
    required this.nameEn,
    required this.nameFr,
    required this.descriptionEn,
    required this.descriptionFr,
    required this.planTier,
    required this.billingPeriod,
    required this.discountPct,
    required this.days,
    required this.amount,
    required this.currency,
    required this.recurring,
    required this.paystackPlanCode,
    required this.active,
    required this.sort,
  });

  factory OfferRow.fromJson(Map<String, dynamic> m) => OfferRow(
        id: J.i(m['id']),
        code: J.s(m['code']),
        nameEn: J.s(m['name_en']),
        nameFr: J.s(m['name_fr']),
        descriptionEn: J.s(m['description_en']),
        descriptionFr: J.s(m['description_fr']),
        planTier: J.s(m['plan_tier']) == 'standard' ? 'standard' : 'premium',
        billingPeriod: J.s(m['billing_period']).isEmpty ? null : J.s(m['billing_period']),
        discountPct: J.i(m['discount_pct']),
        days: J.i(m['days']),
        amount: J.i(m['amount']),
        currency: J.s(m['currency']).isEmpty ? 'USD' : J.s(m['currency']),
        recurring: _flag(m['recurring']),
        paystackPlanCode: J.s(m['paystack_plan_code']),
        active: _flag(m['active']),
        sort: J.i(m['sort']),
      );
}

class BillingInfo {
  final String mode; // 'live' | 'test' | 'off'
  final String learnMode;
  final String callbackUrl;
  final String webhookUrl;
  final List<String> currencies;
  final List<String> merchantCurrencies;
  final double? fxUsdXofRate;
  final String fxSource;
  final PlanCatalog catalog;
  final List<OfferRow> offers;
  final int statsPaid;
  final int statsReview;
  final int statsSubscriptions;
  final int statsProblems;

  const BillingInfo({
    required this.mode,
    required this.learnMode,
    required this.callbackUrl,
    required this.webhookUrl,
    required this.currencies,
    required this.merchantCurrencies,
    required this.fxUsdXofRate,
    required this.fxSource,
    required this.catalog,
    required this.offers,
    required this.statsPaid,
    required this.statsReview,
    required this.statsSubscriptions,
    required this.statsProblems,
  });

  bool get canAutoConvertUsd => merchantCurrencies.contains('XOF') && !merchantCurrencies.contains('USD');

  factory BillingInfo.fromJson(Map<String, dynamic> m) {
    final fx = J.map(m['fx_usd_xof']);
    final stats = J.map(m['stats']);
    final cat = m['catalog'] is Map ? PlanCatalog.fromJson(J.map(m['catalog'])) : PlanCatalog.defaults();
    final curList = (m['currencies'] as List?)?.map((e) => '$e').where((e) => e.isNotEmpty).toList() ?? ['USD', 'EUR', 'CAD', 'XOF'];
    final mCurList = (m['merchant_currencies'] as List?)?.map((e) => '$e').where((e) => e.isNotEmpty).toList() ?? [];
    return BillingInfo(
      mode: J.s(m['mode']).isEmpty ? 'off' : J.s(m['mode']),
      learnMode: J.s(m['learn_mode']) == 'premium' ? 'premium' : 'free',
      callbackUrl: J.s(m['callback_url']),
      webhookUrl: J.s(m['webhook_url']),
      currencies: curList,
      merchantCurrencies: mCurList,
      fxUsdXofRate: fx['rate'] == null ? null : J.n(fx['rate']).toDouble(),
      fxSource: J.s(fx['source']),
      catalog: cat,
      offers: J.list(m['offers']).map(OfferRow.fromJson).toList(),
      statsPaid: J.i(stats['paid']),
      statsReview: J.i(stats['review']),
      statsSubscriptions: J.i(stats['subscriptions']),
      statsProblems: J.i(stats['problems']),
    );
  }
}

class PaymentRow {
  final int id;
  final String reference;
  final int amount;
  final String currency;
  final int displayAmount;
  final String displayCurrency;
  final String invoiceNumber;
  final int days;
  final String status;
  final String statusDetail;
  final DateTime? createdAt;
  final DateTime? paidAt;
  final bool renewal;
  final String firstName;
  final String lastName;
  final String email;
  final String offer;
  final DateTime? premiumUntil;

  const PaymentRow({
    required this.id,
    required this.reference,
    required this.amount,
    required this.currency,
    required this.displayAmount,
    required this.displayCurrency,
    required this.invoiceNumber,
    required this.days,
    required this.status,
    required this.statusDetail,
    required this.createdAt,
    required this.paidAt,
    required this.renewal,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.offer,
    required this.premiumUntil,
  });

  String get learnerName {
    final full = '$firstName $lastName'.trim();
    return full.isNotEmpty ? full : email;
  }

  factory PaymentRow.fromJson(Map<String, dynamic> m) => PaymentRow(
        id: J.i(m['id']),
        reference: J.s(m['reference']),
        amount: J.i(m['amount']),
        currency: J.s(m['currency']).isEmpty ? 'USD' : J.s(m['currency']),
        displayAmount: m['display_amount'] == null ? J.i(m['amount']) : J.i(m['display_amount']),
        displayCurrency: J.s(m['display_currency']).isEmpty ? (J.s(m['currency']).isEmpty ? 'USD' : J.s(m['currency'])) : J.s(m['display_currency']),
        invoiceNumber: J.s(m['invoice_number']),
        days: J.i(m['days']),
        status: J.s(m['status']),
        statusDetail: J.s(m['status_detail']),
        createdAt: J.date(m['created_at']),
        paidAt: J.date(m['paid_at']),
        renewal: _flag(m['renewal']),
        firstName: J.s(m['first_name']),
        lastName: J.s(m['last_name']),
        email: J.s(m['email']),
        offer: J.s(m['offer']),
        premiumUntil: J.date(m['premium_until']),
      );
}

class RevenueBucket {
  final String currency;
  final int amount;
  const RevenueBucket({required this.currency, required this.amount});
}

class PaymentsSummary {
  final int all;
  final int success;
  final int review;
  final int failed;
  final int refunded;
  final int initialized;
  final List<RevenueBucket> revenue;

  const PaymentsSummary({
    required this.all,
    required this.success,
    required this.review,
    required this.failed,
    required this.refunded,
    required this.initialized,
    required this.revenue,
  });

  factory PaymentsSummary.fromJson(Map<String, dynamic> m) => PaymentsSummary(
        all: J.i(m['all']),
        success: J.i(m['success']),
        review: J.i(m['review']),
        failed: J.i(m['failed']),
        refunded: J.i(m['refunded']),
        initialized: J.i(m['initialized']),
        revenue: J
            .list(m['revenue'])
            .map((r) => RevenueBucket(currency: J.s(r['currency']).isEmpty ? 'USD' : J.s(r['currency']), amount: J.i(r['amount'])))
            .toList(),
      );
}

class PeriodDraft {
  double price;
  int discountPct;
  int days;
  bool recurring;
  String paystackPlanCode;

  PeriodDraft({
    required this.price,
    required this.discountPct,
    required this.days,
    required this.recurring,
    required this.paystackPlanCode,
  });

  PeriodDraft copy() => PeriodDraft(
        price: price,
        discountPct: discountPct,
        days: days,
        recurring: recurring,
        paystackPlanCode: paystackPlanCode,
      );

  Map<String, dynamic> toPayload() => {
        'amount': (price * 100).round(),
        'days': days,
        'discount_pct': discountPct,
        'recurring': recurring,
        'paystack_plan_code': paystackPlanCode.trim().isEmpty ? null : paystackPlanCode.trim(),
      };
}

class TierDraft {
  bool active;
  final PeriodDraft monthly;
  final PeriodDraft quarterly;
  final PeriodDraft yearly;

  TierDraft({
    required this.active,
    required this.monthly,
    required this.quarterly,
    required this.yearly,
  });

  PeriodDraft period(String key) => switch (key) {
        'quarterly' => quarterly,
        'yearly' => yearly,
        _ => monthly,
      };

  TierDraft copy() => TierDraft(
        active: active,
        monthly: monthly.copy(),
        quarterly: quarterly.copy(),
        yearly: yearly.copy(),
      );

  Map<String, dynamic> toPayload() => {
        'active': active,
        'periods': {
          'monthly': {...monthly.toPayload(), 'days': monthly.days > 0 ? monthly.days : 30, 'discount_pct': 0},
          'quarterly': {...quarterly.toPayload(), 'days': quarterly.days > 0 ? quarterly.days : 90},
          'yearly': {...yearly.toPayload(), 'days': yearly.days > 0 ? yearly.days : 365},
        },
      };
}

class PlanDraft {
  String currency;
  int quarterlyDiscount;
  int yearlyDiscount;
  int premiumAiCredits;
  final TierDraft standard;
  final TierDraft premium;

  PlanDraft({
    required this.currency,
    required this.quarterlyDiscount,
    required this.yearlyDiscount,
    required this.premiumAiCredits,
    required this.standard,
    required this.premium,
  });

  TierDraft tier(String key) => key == 'standard' ? standard : premium;

  PlanDraft copy() => PlanDraft(
        currency: currency,
        quarterlyDiscount: quarterlyDiscount,
        yearlyDiscount: yearlyDiscount,
        premiumAiCredits: premiumAiCredits,
        standard: standard.copy(),
        premium: premium.copy(),
      );

  factory PlanDraft.fromCatalog(PlanCatalog? c) {
    final src = c ?? PlanCatalog.defaults();
    TierDraft mapTier(TierCatalog t, int qDisc, int yDisc) => TierDraft(
          active: t.active,
          monthly: PeriodDraft(
            price: t.monthly.amount / 100.0,
            discountPct: 0,
            days: t.monthly.days,
            recurring: t.monthly.recurring,
            paystackPlanCode: t.monthly.paystackPlanCode,
          ),
          quarterly: PeriodDraft(
            price: t.quarterly.amount / 100.0,
            discountPct: t.quarterly.discountPct > 0 || src.configured ? t.quarterly.discountPct : qDisc,
            days: t.quarterly.days,
            recurring: t.quarterly.recurring,
            paystackPlanCode: t.quarterly.paystackPlanCode,
          ),
          yearly: PeriodDraft(
            price: t.yearly.amount / 100.0,
            discountPct: t.yearly.discountPct > 0 || src.configured ? t.yearly.discountPct : yDisc,
            days: t.yearly.days,
            recurring: t.yearly.recurring,
            paystackPlanCode: t.yearly.paystackPlanCode,
          ),
        );
    return PlanDraft(
      currency: src.currency,
      quarterlyDiscount: src.quarterlyDiscount,
      yearlyDiscount: src.yearlyDiscount,
      premiumAiCredits: src.premiumAiCredits,
      standard: mapTier(src.standard, src.quarterlyDiscount, src.yearlyDiscount),
      premium: mapTier(src.premium, src.quarterlyDiscount, src.yearlyDiscount),
    );
  }

  Map<String, dynamic> toPayload() => {
        'currency': currency,
        'discounts': {'quarterly': quarterlyDiscount, 'yearly': yearlyDiscount},
        'premium_ai_credits': premiumAiCredits,
        'tiers': {
          'standard': standard.toPayload(),
          'premium': premium.toPayload(),
        },
      };
}

class OnlineFmt {
  OnlineFmt._();

  static const zeroDecimalCurrencies = {'XOF', 'RWF'};

  static String roleLabel(String role, bool fr) => switch (role) {
        'learner' => fr ? 'Apprenant site' : 'Website learner',
        'student' => fr ? 'Étudiant' : 'Student',
        'candidate' => fr ? 'Apprenant entreprise' : 'Company learner',
        'org_admin' => fr ? 'Resp. entreprise' : 'Company manager',
        _ => role,
      };

  static Color roleColor(String role) => switch (role) {
        'learner' => const Color(0xFF4F46E5),
        'student' => const Color(0xFF1D4ED8),
        'candidate' => const Color(0xFF047857),
        'org_admin' => const Color(0xFF0F766E),
        _ => AppColors.textMuted,
      };

  static String levelLabel(String level, bool fr) =>
      level == 'beginner' ? (fr ? 'Débutant' : 'Beginner') : level.toUpperCase();

  static Color levelColor(String level) {
    if (level.isEmpty || level == 'beginner') return AppColors.textMuted;
    return Pill.levelColor(level);
  }

  static String actionLabel(String action, bool fr) => switch (action) {
        'signup' => fr ? 'Inscription' : 'Signed up',
        'premium_granted' => fr ? 'Forfait activé' : 'Plan activated',
        'premium_revoked' => fr ? 'Forfait terminé' : 'Plan ended',
        'premium_requested' => fr ? 'A demandé Premium' : 'Asked for Premium',
        'premium_request_dismissed' => fr ? 'Demande classée' : 'Request dismissed',
        'website_access' => fr ? 'Accès site modifié' : 'Website access changed',
        'google_linked' => fr ? 'Connexion Google ajoutée' : 'Google sign-in added',
        'google_unlinked' => fr ? 'Connexion Google retirée' : 'Google sign-in removed',
        'password_changed' => fr ? 'Mot de passe modifié' : 'Password changed',
        'password_reset' => fr ? 'Mot de passe réinitialisé' : 'Password reset',
        'suspended' => fr ? 'Compte suspendu' : 'Suspended',
        'restored' => fr ? 'Compte réactivé' : 'Restored',
        _ => action,
      };

  static String paymentStatusLabel(String status, bool fr) => switch (status) {
        'success' => fr ? 'Payé' : 'Paid',
        'review' => fr ? 'À vérifier' : 'To review',
        'failed' => fr ? 'Échoué' : 'Failed',
        'refunded' => fr ? 'Remboursé' : 'Refunded',
        'disputed' => fr ? 'Litige' : 'Disputed',
        'initialized' => fr ? 'En cours' : 'In progress',
        'abandoned' => fr ? 'Abandonné' : 'Abandoned',
        _ => status,
      };

  static Color paymentStatusColor(String status) => switch (status) {
        'success' => AppColors.good,
        'review' => AppColors.warn,
        'failed' || 'disputed' => AppColors.bad,
        'refunded' => const Color(0xFF4F46E5),
        'initialized' => const Color(0xFF0284C7),
        _ => AppColors.textMuted,
      };

  static double roundPrice(double val, String currency) {
    final safe = val.isFinite && val > 0 ? val : 0.01;
    if (zeroDecimalCurrencies.contains(currency)) {
      return safe.round().clamp(1, 999999999).toDouble();
    }
    return ((safe * 100).round() / 100).clamp(0.01, 999999999.0).toDouble();
  }

  static double discountedPrice(double monthlyPrice, int months, int pct, String currency) {
    return roundPrice(monthlyPrice * months * (1 - pct / 100.0), currency);
  }

  static String inputPriceText(double val, String currency) {
    if (zeroDecimalCurrencies.contains(currency) || val % 1 == 0) return '${val.round()}';
    return val.toStringAsFixed(2);
  }

  static int? approxXofSubunits(int usdSubunits, double? fxRate) {
    if (fxRate == null || fxRate <= 0) return null;
    final xof = (((usdSubunits / 100.0) * fxRate) / 50.0).round() * 50;
    return (xof < 100 ? 100 : xof) * 100;
  }

  static String money(int subunits, String currency, bool fr) {
    final decimals = subunits % 100 == 0 ? 0 : 2;
    try {
      return NumberFormat.simpleCurrency(
        locale: fr ? 'fr_FR' : 'en_CA',
        name: currency,
        decimalDigits: decimals,
      ).format(subunits / 100.0);
    } catch (_) {
      final n = (subunits / 100.0).toStringAsFixed(decimals);
      return '$n $currency';
    }
  }

  static String whatsappDigits(String raw) => raw.replaceAll(RegExp(r'\D'), '');
}
