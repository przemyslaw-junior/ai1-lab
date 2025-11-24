<?php /** @var \App\Model\Book $book */ ?>

<div class="form-group">
    <label>Title</label>
    <input type="text" name="book[title]" value="<?= $book->getTitle() ?>">
</div>

<div class="form-group">
    <label>Author</label>
    <input type="text" name="book[author]" value="<?= $book->getAuthor() ?>">
</div>

<div class="form-group">
    <label>Year</label>
    <input type="number" name="book[year]" value="<?= $book->getYear() ?>">
</div>

<div class="form-group">
    <input type="submit" value="Submit">
</div>