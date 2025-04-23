all: clear render run

clear: 
	rm -rf .quarto _site

render: 
	quarto render 
	cp -r static/* docs/

run: 
	firefox docs/index.html

