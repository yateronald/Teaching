import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/constants/app_colors.dart';
import 'package:mobile/features/admin/common/admin_nav.dart';
import 'package:mobile/features/admin/demo_requests/demo_model.dart';

void main() {
  group('AdminTab indices', () {
    test('meetings and calendar tabs sit cleanly between demoRequests and marketing', () {
      const indices = [
        AdminTab.dashboard,
        AdminTab.users,
        AdminTab.companies,
        AdminTab.onlineCourses,
        AdminTab.batches,
        AdminTab.demoRequests,
        AdminTab.meetings,
        AdminTab.calendar,
        AdminTab.marketing,
        AdminTab.emails,
        AdminTab.timetable,
        AdminTab.attendance,
        AdminTab.resources,
        AdminTab.examPrep,
        AdminTab.monitoring,
        AdminTab.aiEngine,
        AdminTab.settings,
        AdminTab.profile,
      ];

      expect(AdminTab.demoRequests, 5);
      expect(AdminTab.meetings, 6);
      expect(AdminTab.calendar, 7);
      expect(AdminTab.profile, 17);
      expect(indices.toSet().length, 18);
      for (var i = 0; i < indices.length; i++) {
        expect(indices[i], i);
      }
    });
  });

  group('Demo availability helpers', () {
    test('availabilityLabel returns localized labels', () {
      expect(Demo.availabilityLabel('pending', false), 'Availability requested');
      expect(Demo.availabilityLabel('pending', true), 'En attente de créneaux');
      expect(Demo.availabilityLabel('submitted', false), 'Availability received');
      expect(Demo.availabilityLabel('submitted', true), 'Disponibilités reçues');
      expect(Demo.availabilityLabel('expired', false), 'Link expired');
      expect(Demo.availabilityLabel('superseded', false), 'Link superseded');
    });

    test('availabilityColor maps each status cleanly', () {
      expect(Demo.availabilityColor('submitted'), AppColors.good);
      expect(Demo.availabilityColor('pending'), const Color(0xFF4F46E5));
      expect(Demo.availabilityColor('expired'), AppColors.warn);
      expect(Demo.availabilityColor('superseded'), AppColors.warn);
    });

    test('formatSlot formats date and window', () {
      expect(
        Demo.formatSlot({'date': '2026-12-01', 'start': '10:00', 'end': '11:30'}),
        '2026-12-01 · 10:00 – 11:30',
      );
    });
  });
}
