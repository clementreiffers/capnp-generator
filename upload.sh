yarn build
echo -e "#!/usr/bin/env node\n$(cat todo.txt)" > todo.txt
npm version patch --force
npm publish
