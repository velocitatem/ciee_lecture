# Build PDF with pdflatex (run twice for stable references)
PDF := presentation.pdf
TEX := presentation.tex

.PHONY: all clean

all: $(PDF)

$(PDF): $(TEX)
	pdflatex -interaction=nonstopmode -file-line-error $(TEX)
	pdflatex -interaction=nonstopmode -file-line-error $(TEX)

clean:
	rm -f *.aux *.log *.out *.toc *.nav *.snm *.vrb *.fls *.fdb_latexmk *.synctex.gz

cleanall: clean
	rm -f $(PDF)
