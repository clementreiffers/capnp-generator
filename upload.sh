yarn build
echo -e "#!/usr/bin/env node\n$(cat build/index.js)" > build/index.js
npm version patch --force
npm publish
