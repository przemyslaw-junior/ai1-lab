<?php
/** @var \App\Model\Book $book */
/** @var \App\Service\Router $router */

$title = "Edit Book {$book->getTitle()} ({$book->getId()})";
$bodyClass = "edit";

ob_start(); ?>
    <h1><?= $title ?></h1>
    <form action="<?= $router->generatePath('book-edit') ?>" method="post" class="edit-form">
        <?php include __DIR__ . '/_form.html.php'; ?>
        <input type="hidden" name="action" value="book-edit">
        <input type="hidden" name="id" value="<?= $book->getId() ?>">
    </form>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('book-index') ?>">Back to list</a></li>
        <li>
            <form action="<?= $router->generatePath('book-delete') ?>" method="post">
                <input type="submit" value="Delete" onclick="return confirm('Are you sure?')">
                <input type="hidden" name="action" value="book-delete">
                <input type="hidden" name="id" value="<?= $book->getId() ?>">
            </form>
        </li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . '/../base.html.php';