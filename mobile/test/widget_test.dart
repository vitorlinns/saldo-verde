// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';

import 'package:saldoverde/main.dart';

void main() {
  testWidgets('Displays login screen', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    // Build the app and trigger a frame.
    await tester.pumpWidget(const SaldoVerdeApp(initialRoute: '/login'));
    await tester.pumpAndSettle();

    // Verify that the login screen is shown.
    expect(find.text('E-mail'), findsOneWidget);
    expect(find.text('Entrar'), findsOneWidget);
  });
}
