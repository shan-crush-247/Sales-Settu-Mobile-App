# SalesSetu - React Native app (demo build)

Built from the **SFA As-Is Functionality Handbook v5.1**. React Native + Expo (SDK 57), JavaScript.

All data is **temporary and stored on the phone** (AsyncStorage), seeded with sample users, dealers, beats,
products, invoices and pick-lists (`src/data/seed.js`). There is no SQL / Salesforce / OOP / SAP connection yet;
the "sync" is simulated so order statuses move the way the handbook describes.

## Download
**[Download the latest APK (Android)](https://github.com/shan-crush-247/Sales-Settu-Mobile-App/releases/latest)** - open the release and tap `SalesSetu-v1.1.1.apk`.

## Install on a phone
1. Download `SalesSetu-v1.1.1.apk` on an Android phone (Android 7.0+) and open it (allow "Install unknown apps").
2. Log in: **SE-1001 / demo123**.
3. iPhone: run the project with `npx expo start --lan --go` and open it in the **Expo Go** app.

## What is covered (handbook screen numbers)
| Area | Screens |
|---|---|
| Login and daily sync | Login, first-login-of-the-day sync ("Starting X of 30 data stores") - 4.1 |
| Home | Day Start (selfie + GPS lat/long), Day End, day timer, Beat Highlights, Sales Target (Monthly/Quarterly/Half Year/Annual), Leader Board, Premium / Dormant BPs, Product Catalogue - 4.2, 4.3 |
| Visits | Visit Plans (Today's Beat / All Beat's, search, Reschedule), Beat outlet list with check-in time, time spent, tick / warning, End Trip - 4.4, 4.5 |
| Dealers | BP directory (A-Z, search, QR scan, + Add New BP request), Store Info (GST + status, billing/shipping, credit limit by division, frequently ordered), History (Orders / Invoices / Initiate Return) - 4.7-4.11 |
| Task boards | **Via Beat Plan**: timer + Check In, Order Capturing, Competitor Survey, Planogram (photos), Digital Signature. **Directly from BP page**: Payment, Survey - 4.6, 4.10 |
| Take order | Select Supplier, catalogue (All / Quick Pick / Frequently Ordered / Newly Added / Pre-Book, search, filter, QR), colour + style + size entry with stock colours and Stock Sync At, remarks, Order Summary (view / edit / delete), Delivery Details (Change Supplier, Order Type, Customer Ref, billing/shipping + GSTIN status, Transport Mode, Transporter / Destination read-only, Dispatch Date, Remarks 255), credit-limit check, one division per order - 4.12-4.21 |
| After the order | "Success" (online) or "Order Saved - it will be sent automatically" (offline), Draft status, My Orders (Period / Status filters, search), order details + tracking timeline + amount summary (5% GST) - 4.22-4.27 |
| Payment | Invoices with ageing (All / 0-30 / 31-60 / 60+), pay invoice, Advance Pay, Payment History; Outstanding Dues report (Area > BP > Invoice) - 4.28, 4.29 |
| HRMS | Attendance calendar (Present / Absent / Leave / Half Day), Regularize + requests list, Leaves Info, Apply Leave, Leaves History - 4.31-4.33 |
| General | Expense list + filters, New Expense (type, amount, date, bill photo, Draft / Confirm); Survey (Outlet Specific / Generic), Customer Feedback complaint form with photo - 4.34-4.37 |
| Dashboards | Executive Dashboard computed from phone data (target vs sales, at risk, order status, outstanding ageing, coverage) - 4.39 |
| Profile | My Profile, Settings: Sync Now, Last Sync, pending count, offline storage, Sync Errors, Logout, Reset demo data - 4.46 |

## Simulated sync
* New orders are **Draft**. A 5-minute timer (or **Profile > Settings > Sync Now**) posts them -> **Order Placed**.
* Each further Sync Now moves orders one step: Order Confirmed (OOP order no. shown) -> Approved -> Invoiced -> Dispatched.
* With no network, orders are kept on the phone ("Order Saved") and Sync Now logs a Sync Error.

## Quick test path
Log in -> Day Start (selfie + GPS) -> Visit Plans -> DAVANAGERE 1 -> New Om Saree Centre -> Check In -> Order Capturing
-> pick supplier -> 100% Cotton -> add sizes -> Preview Order -> Confirm Order -> fill Order Type / Transport Mode -> Confirm Order
-> Success -> order details (Draft) -> Profile > Sync Now (Order Placed) -> Sync Now again (Order Confirmed).
QR demo: any QR containing a BP code (e.g. `C051500`) or product code (e.g. `P1`).

## Build the APK again
```
set JAVA_HOME=C:\Users\E26-03822\dev-tools\jdk\jdk-17.0.20.1+1
set ANDROID_HOME=C:\Users\E26-03822\dev-tools\android-sdk
cd C:\DMApp && powershell -File build-apk.ps1   (project must stay at a short path like C:\DMApp - Windows 260-char limit)
```
Output: `android/app/build/outputs/apk/release/app-release.apk` (signed with the debug key - fine for testing, not for Play Store).

## Next steps for a live app
Replace `src/store/AppStore.js` actions with API calls (Salesforce / OOP), keep AsyncStorage as the offline queue,
and generate a proper release keystore.
