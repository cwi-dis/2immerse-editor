.PHONY: test frontend

frontend:
	bash scripts/build_frontend.sh

test:
	bash scripts/run_tests.sh
