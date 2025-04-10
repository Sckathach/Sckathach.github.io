all: clear render run

clear: 
	rm -rf .quarto _site

render: 
	quarto render 

run: 
	firefox docs/index.html

