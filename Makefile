.PHONY: builddevjs
builddevjs:
	$(info [INFO]: Generando bundle JS para desarrollo)
	npm run builddev
.PHONY: buildjs
buildjs:
	$(info [INFO]: Generando bundle JS de producción)
	npm run buildprod
test:
	node src/tests.js
testcte:
	node src/test_cte.js
npminstall:
	$(info [INFO]: Instalación de nodejs y dependencias JS)
	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install -g yarn eslint babel-eslint eslint-plugin-react http-server webpack webpack-dev-server
	yarn
