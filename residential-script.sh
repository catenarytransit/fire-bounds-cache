rm -rf fire-temp
git clone https://github.com/catenarytransit/fire-bounds-cache fire-temp
cd fire-temp
bun run download_evac.ts
git add .
git commit -m "download_evac auto"
git push
cd ..
rm -rf fire-temp
