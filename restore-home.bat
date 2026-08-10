@echo off
setlocal enabledelayedexpansion
REM ===========================================================
REM  Restores the home page to its last committed state.
REM
REM  Two different problems, two different fixes:
REM    1. Files that EXISTED before and were edited  -> git restores them
REM    2. Files that were CREATED during integration -> git never saw
REM       them, so they must be deleted by hand
REM
REM  Backend work is untouched. Nothing outside eccommerce/src
REM  is modified. git clean is deliberately NOT used, because it
REM  would also wipe the backend cart/wishlist modules.
REM ===========================================================

cd /d "%~dp0"

echo.
echo === Checking this is a git repo ===
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ERROR: not a git repository. Run this from the project root.
  pause
  exit /b 1
)

echo.
echo === Saving a safety snapshot first ===
REM If anything below is wrong, this stash has your current state.
git stash push -u -m "pre-home-revert-snapshot" -- eccommerce/src
if errorlevel 1 (
  echo Nothing to stash, or stash failed. Continuing.
) else (
  echo Snapshot saved. Recover it any time with:  git stash pop
)

echo.
echo === Restoring modified files from the last commit ===
for %%F in (
  "eccommerce/src/components/SectionStartExploring.jsx"
  "eccommerce/src/components/QuickViewPanel.jsx"
  "eccommerce/src/components/SectionSliderProductCard.jsx"
  "eccommerce/src/components/SectionSliderLargeProduct.jsx"
  "eccommerce/src/components/SectionFindFavorite.jsx"
  "eccommerce/src/components/ProductCard.jsx"
  "eccommerce/src/context/CartContext.jsx"
  "eccommerce/src/redux/slices/cartSlice.js"
  "eccommerce/src/redux/slices/wishlistSlice.js"
  "eccommerce/src/redux/slices/productsSlice.js"
  "eccommerce/src/utils/cartToast.jsx"
  "eccommerce/src/services/api.js"
) do (
  git checkout HEAD -- %%F 2>nul
  if errorlevel 1 (
    echo   [new file - will delete instead] %%F
  ) else (
    echo   [restored] %%F
  )
)

echo.
echo === Deleting files that were created during integration ===
REM git cannot restore these: they were never committed.
for %%F in (
  "eccommerce\src\services\productsApi.js"
  "eccommerce\src\services\cartApi.js"
  "eccommerce\src\services\wishlistApi.js"
  "eccommerce\src\utils\productAdapter.js"
  "eccommerce\src\components\RailNotice.jsx"
) do (
  if exist %%F (
    del /q %%F
    echo   [deleted] %%F
  ) else (
    echo   [already gone] %%F
  )
)

echo.
echo === Any leftover new files under src? ===
REM Anything still listed here was created during integration and is
REM not in the delete list above - check it before the app will build.
git ls-files --others --exclude-standard -- eccommerce/src

echo.
echo === Remaining differences vs the last commit ===
REM Ideally this prints nothing. M = still modified, ?? = still new.
git status --short -- eccommerce/src

echo.
echo ===========================================================
echo  Done. Now restart the dev server - Vite caches the module
echo  graph and will complain about the deleted imports otherwise:
echo.
echo     cd eccommerce
echo     npm run dev
echo.
echo  Undo all of this with:  git stash pop
echo ===========================================================
pause
