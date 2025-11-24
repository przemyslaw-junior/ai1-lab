<?php
namespace App\Controller;

use App\Exception\NotFoundException;
use App\Model\Book;
use App\Service\Router;
use App\Service\Templating;

class BookController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $books = Book::findAll();
        return $templating->render('book/index.html.php', [
            'books' => $books,
            'router' => $router,
        ]);
    }

    public function createAction(?array $requestBook, Templating $templating, Router $router): ?string
    {
        if ($requestBook) {
            $book = Book::fromArray($requestBook);
            $book->save();

            $router->redirect($router->generatePath('book-index'));
            return null;
        }

        return $templating->render('book/create.html.php', [
            'book' => new Book(),
            'router' => $router,
        ]);
    }

    public function editAction(int $bookId, ?array $requestBook, Templating $templating, Router $router): ?string
    {
        $book = Book::find($bookId);
        if (!$book) throw new NotFoundException("Book not found");

        if ($requestBook) {
            $book->fill($requestBook);
            $book->save();

            $router->redirect($router->generatePath('book-index'));
            return null;
        }

        return $templating->render('book/edit.html.php', [
            'book' => $book,
            'router' => $router,
        ]);
    }

    public function showAction(int $bookId, Templating $templating, Router $router): ?string
    {
        $book = Book::find($bookId);
        if (!$book) throw new NotFoundException("Book not found");

        return $templating->render('book/show.html.php', [
            'book' => $book,
            'router' => $router,
        ]);
    }

    public function deleteAction(int $bookId, Router $router): ?string
    {
        $book = Book::find($bookId);
        if (!$book) throw new NotFoundException("Book not found");

        $book->delete();

        $router->redirect($router->generatePath('book-index'));
        return null;
    }
}