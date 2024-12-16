import styles from "./Form.module.css";
import Input from "./Input";
import { useState, useEffect } from "react";
import Select from "./Select";

function BookForm({ handleSubmit, bookData, btnText }) {
  const [book, setBook] = useState(bookData || {}); // Dados do livro
  const [preview, setPreview] = useState([]); // Para mostrar a imagem do livro

  const conditions = ["New", "Used", "Like New", "Good", "Acceptable"];
  const transactionTypes = ["Sell", "Donate", "Exchange"];

  // Função para lidar com o upload das imagens
  function onFileChange(e) {
    const files = Array.from(e.target.files);
    setPreview(files);
    setBook({ ...book, images: files }); // Atualiza as imagens no estado
  }

  // Função para lidar com as mudanças nos campos de texto
  function handleBookChange(e) {
    setBook({ ...book, [e.target.name]: e.target.value });
  }

  // Função para lidar com a seleção de opções
  function handleSelectChange(e) {
    const { name, value } = e.target;
    setBook({
      ...book,
      [name]: value,
    });
  }

  // Função para submeter o formulário
  function submit(e) {
    e.preventDefault();
    console.log(book); // Mostra os dados do livro para depuração
    handleSubmit(book); // Chama a função de envio com os dados do livro
  }

  useEffect(() => {
    // Se bookData mudar, atualiza o estado do livro
    if (bookData) {
      setBook(bookData);
    }
  }, [bookData]);

  return (
    <form onSubmit={submit} className={styles.form_container}>
      <div className={styles.book_preview_images}>
        {preview.length > 0
          ? preview.map((image, index) => (
              <img
                src={URL.createObjectURL(image)}
                alt={`Book ${book.title} ${index}`}
                key={`${book.title}-${index}`}
              />
            ))
          : book.images &&
            book.images.map((image, index) => (
              <img
                src={`${process.env.REACT_APP_API}/images/books/${image}`}
                alt={`Book ${book.title} ${index}`}
                key={`${book.title}-${index}`}
              />
            ))}
      </div>

      {/* Campo para adicionar imagens do livro */}
      <Input
        text="Book Image"
        type="file"
        name="images"
        handleOnChange={onFileChange}
        multiple={true}
      />

      {/* Campo para título do livro */}
      <Input
        text="Title"
        type="text"
        name="title"
        placeholder="Enter the title"
        handleOnChange={handleBookChange}
        value={book.title || ""}
      />

      {/* Campo para autor do livro */}
      <Input
        text="Author"
        type="text"
        name="author"
        placeholder="Enter the author"
        handleOnChange={handleBookChange}
        value={book.author || ""}
      />

      {/* Campo para a descrição do livro */}
      <Input
        text="Description"
        type="text"
        name="description"
        placeholder="Enter a description"
        handleOnChange={handleBookChange}
        value={book.description || ""}
      />

      {/* Campo para o gênero do livro */}
      <Input
        text="Genre"
        type="text"
        name="genre"
        placeholder="Enter the genre"
        handleOnChange={handleBookChange}
        value={book.genre || ""}
      />

      {/* Campo para a linguagem do livro */}
      <Input
        text="Language"
        type="text"
        name="language"
        placeholder="Enter the language"
        handleOnChange={handleBookChange}
        value={book.language || ""}
      />

      {/* Seletor de condição do livro */}
      <Select
        text="Condition"
        name="condition"
        options={conditions}
        handleOnChange={handleSelectChange}
        value={book.condition || ""}
      />

      {/* Campo para a quantidade de livros */}
      <Input
        text="Quantity"
        type="number"
        name="quantity"
        placeholder="Enter the quantity"
        handleOnChange={handleBookChange}
        value={book.quantity || ""}
      />

      {/* Seletor de tipo de transação */}
      <Select
        text="Transaction Type"
        name="transactionType"
        options={transactionTypes}
        handleOnChange={handleSelectChange}
        value={book.transactionType || ""}
      />

      {/* Campo oculto para status de transação */}
      <Input
        type="hidden"
        name="transactionStatus"
        value="Pending" // O status inicial é "Pending"
      />

      {/* Botão para submeter o formulário */}
      <Input type="submit" value={btnText || (bookData ? 'Edit Book' : 'Add Book')} />
    </form>
  );
}

export default BookForm;
