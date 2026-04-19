# 🔐 Vercel Production Environment Variables

Copy and paste these variables into your **Vercel Project Settings -> Environment Variables**. This will enable live blockchain data tracking and Firebase authentication.

## 📦 Firebase Configuration (Mobile & Web)
| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `global-foodtech-bridge-prod` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:883616117431:web:8775ad9f79c4c3461b5332` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `global-foodtech-bridge-prod.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDMPUvzJ5VUkZKkObIvJB84wNycsyH3BgU` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `global-foodtech-bridge-prod.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `883616117431` |

## 🔗 Railway Backend Services
| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL` | `https://blockchain-service.up.railway.app/api/v1` |
| `NEXT_PUBLIC_IOT_SERVICE_URL` | `https://iot-service.up.railway.app/api/v1` |
| `NEXT_PUBLIC_PASSPORT_SERVICE_URL` | `https://passport-service.up.railway.app/api/v1` |

## 🛡️ Security / Auth
| Variable | Value |
| :--- | :--- |
| `INTERNAL_API_KEY` | `[Set a Secure Random String - Must match Railway]` |

> [!IMPORTANT]
> **Check Deployment**: After adding these variables, you MUST **Redeploy** your project in Vercel for the changes to take effect.

> [!TIP]
> Use a tool like [PWGen](https://www.pwgen.org/) to generate a strong `INTERNAL_API_KEY`. This key secures the communication between your Frontend and Backend services.
