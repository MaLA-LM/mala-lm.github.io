window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class (not every page loads the plugins)
    if (typeof bulmaCarousel !== 'undefined') {
        var carousels = bulmaCarousel.attach('.carousel', options);
    }

    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }

    // Add a copy button to each BibTeX block
    $('#BibTeX pre').each(function() {
        var pre = this;
        var button = $('<button type="button" class="copy-button">Copy</button>');
        $(pre).wrap('<div class="bibtex-wrap"></div>').before(button);

        button.on('click', function() {
            var text = $(pre).text().trim();
            var done = function() {
                button.text('Copied').addClass('copied');
                setTimeout(function() { button.text('Copy').removeClass('copied'); }, 2000);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(done);
            } else {
                var area = $('<textarea>').val(text).css({ position: 'fixed', opacity: 0 }).appendTo('body');
                area[0].select();
                document.execCommand('copy');
                area.remove();
                done();
            }
        });
    });

})
