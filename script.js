$(document).ready(function () {
    let searchHistory = [];
    let bookshelf = [];

    // Search Functionality
    $('#search-button').click(function () {
        const query = $('#search-input').val().trim();
        if (!query) return;

        updateSearchHistory(query);
        searchBooks(query);
    });

    // Grid/List View Toggle
    $('#grid-view, #list-view').click(function () {
        const view = $(this).attr('id') === 'grid-view' ? 'grid-view' : 'list-view';
        $('#results').removeClass('grid-view list-view').addClass(view);
        $('#grid-view, #list-view').removeClass('active');
        $(this).addClass('active');
    });

    // Display Bookshelf
    $('#show-bookshelf').click(function () {
        $('#bookshelf').removeClass('hidden');
        renderBookshelf();
    });

    $('#close-bookshelf').click(function () {
        $('#bookshelf').addClass('hidden');
    });

    // Search History
    function updateSearchHistory(query) {
        if (!searchHistory.includes(query)) {
            searchHistory.push(query);
            $('#history-list').append(`<li class="history-item">${query}</li>`);
        }
    }

    $(document).on('click', '.history-item', function () {
        const query = $(this).text();
        searchBooks(query);
    });

    // Search Books
    function searchBooks(query) {
        $.ajax({
            url: `https://www.googleapis.com/books/v1/volumes?q=${query}`,
            method: 'GET',
            success: function (data) {
                renderSearchResults(data.items);
            }
        });
    }

    // Render Search Results
    function renderSearchResults(books) {
        const template = $('#search-result-template').html();
        $('#results').html('');
        books.forEach(book => {
            const bookData = {
                thumbnail: book.volumeInfo.imageLinks?.thumbnail || '',
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors?.join(', ') || 'Unknown Author'
            };
            $('#results').append(Mustache.render(template, bookData));
        });
    }

    // Render Bookshelf
    function renderBookshelf() {
        const template = $('#bookshelf-template').html();
        $('#bookshelf-content').html('');
        bookshelf.forEach(book => {
            $('#bookshelf-content').append(Mustache.render(template, book));
        });
    }
});

