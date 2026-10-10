import React from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store/AppStore';
import { C, todayKey } from './src/theme';
import { DatePickHost } from './src/components/DatePick';
import { LoginScreen, DailySyncScreen, HomeScreen, DayStartScreen } from './src/screens/Start';
import { VisitPlansScreen, BeatOutletsScreen, BPListScreen, AddBPScreen, ScanScreen, DealerScreen, PaymentScreen, ReturnScreen, PlanogramScreen, SignatureScreen } from './src/screens/Dealers';
import { CatalogScreen, ProductEntryScreen, CartScreen, DeliveryScreen, MyOrdersScreen, OrderDetailScreen } from './src/screens/Orders';
import { MoreScreen, AttendanceScreen, RegularizeScreen, RegularizationsScreen, ApplyLeaveScreen, LeaveHistoryScreen, ExpensesScreen, AddExpenseScreen, SurveyScreen, SurveyFormScreen, OutstandingScreen, DashboardScreen, ProfileScreen } from './src/screens/More';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const icon = { Home: '⌂', 'Visit Plans': '⚑', 'My Orders': '☰', BP: '▦', More: '☷' };

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false, tabBarActiveTintColor: C.green, tabBarInactiveTintColor: '#9A9CB8',
      tabBarIcon: ({ color, focused }) => (
        <View style={{ backgroundColor: focused ? C.greenLight : 'transparent', borderRadius: 12, width: 54, height: 30, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color, fontSize: 18, lineHeight: 22, fontWeight: '800', includeFontPadding: false }}>{icon[route.name]}</Text>
        </View>),
      tabBarIconStyle: { width: 56, height: 32 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      tabBarStyle: { height: 74, paddingTop: 8, paddingBottom: 12, borderTopWidth: 0, backgroundColor: '#fff', elevation: 16, shadowColor: '#3B2FC9', shadowOpacity: 0.12, shadowRadius: 14 },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Visit Plans" component={VisitPlansScreen} />
      <Tab.Screen name="My Orders" component={MyOrdersScreen} />
      <Tab.Screen name="BP" component={BPListScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

const SCREENS = {
  DayStart: DayStartScreen, BeatOutlets: BeatOutletsScreen, Dealer: DealerScreen, AddBP: AddBPScreen, Scan: ScanScreen, Payment: PaymentScreen,
  Return: ReturnScreen, Planogram: PlanogramScreen, Signature: SignatureScreen, Catalog: CatalogScreen, ProductEntry: ProductEntryScreen, Cart: CartScreen,
  Delivery: DeliveryScreen, OrderDetail: OrderDetailScreen, Attendance: AttendanceScreen, Regularize: RegularizeScreen, Regularizations: RegularizationsScreen,
  ApplyLeave: ApplyLeaveScreen, LeaveHistory: LeaveHistoryScreen, Expenses: ExpensesScreen, AddExpense: AddExpenseScreen, Survey: SurveyScreen,
  SurveyForm: SurveyFormScreen, Outstanding: OutstandingScreen, Dashboard: DashboardScreen, Profile: ProfileScreen,
};

function Root() {
  const { state } = useApp();
  if (!state.loggedIn) return <LoginScreen />;
  if (state.lastLoginDay !== todayKey()) return <DailySyncScreen />;   // first login of the day: patch + data download
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        {Object.entries(SCREENS).map(([name, comp]) => <Stack.Screen key={name} name={name} component={comp} />)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Root />
        <DatePickHost />
      </AppProvider>
    </SafeAreaProvider>
  );
}
