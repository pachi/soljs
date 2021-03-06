.PHONY: test
test:
	$(info [INFO]: Testing soljs.js)
	node src/test.js

.PHONY: test
testalt:
	$(info [INFO]: Testing soljsalt.js)
	node src/testalt.js

patch:
	npm version patch

minor:
	npm version minor

major:
	npm version major

publish:
	npm publish

.PHONY: npminstall
npminstall:
	$(info [INFO]: Installing nodejs and other dependencies)
	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install -g eslint
	npm install
