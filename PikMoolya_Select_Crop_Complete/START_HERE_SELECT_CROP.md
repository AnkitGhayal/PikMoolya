# PikMoolya — Select Crop Complete Package

This package is aligned with the existing PikMoolya architecture and the original Master Build Prompt.

## Mobile app

Use the included `App.tsx` as the complete replacement for:

`C:\Users\asus\OneDrive\Desktop\PikMoolya\apps\mobile\App.tsx`

It contains the crop selector as a dropdown and uses the backend `/crops` API rather than a hardcoded crop ID.

## Test

Open PowerShell:

```powershell
cd C:\Users\asus\OneDrive\Desktop\PikMoolya\apps\mobile
npx tsc --noEmit
npx expo start -c
```

Do not stop the NestJS backend.

## Important

The crop selector is only the UI layer. The actual crop list must come from the PikMoolya backend database. The next integration step is to populate that database with the Maharashtra crop/variety master and then connect real market data to the existing Fair Price / Market Comparison / Best Net Deal flow.
