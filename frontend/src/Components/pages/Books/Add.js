import styles from "./AddBook.module.css";  // Estilos para a página
import api from "../../../utils/api";  // Função para enviar requisições à API
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFlashMessage from "../../../hooks/useFlashMessage";  // Hook para mensagens de feedback
import BookForm from "../../form/BookForm";  // O formulário que você irá usar para pegar os dados do livro

function AddBook() {
  const [token] = useState(localStorage.getItem('token') || '');  // Pega o token armazenado no localStorage
  const { setFlashMessage } = useFlashMessage();  // Função para mostrar a mensagem de sucesso ou erro
  const navigate = useNavigate();  // Hook de navegação para redirecionar o usuário após o sucesso

  // Função para registrar o livro
  async function registerBook(book) {
    let msgType = 'success';  // Inicializa o tipo da mensagem (sucesso)
    const formData = new FormData();  // Criando FormData para enviar arquivos (imagem da capa, por exemplo)

    // Preenchendo o FormData com os dados do livro
    await Object.keys(book).forEach((key) => {
      if (key === 'images') {  // Caso o campo seja 'images' (para imagem da capa do livro)
        for (let i = 0; i < book[key].length; i++) {
          formData.append('images', book[key][i]);  // Adiciona cada imagem à FormData
        }
      } else {
        formData.append(key, book[key]);  // Adiciona os outros dados do livro
      }
    });

    // Envio dos dados para a API
    const data = await api
      .post(`books/create`, formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,  // Passando o token para autenticação
          'Content-Type': 'multipart/form-data',  // Tipo de conteúdo para envio de arquivos
        },
      })
      .then((response) => {
        console.log(response.data);  // Log da resposta
        return response.data;  // Retorna os dados recebidos da resposta
      })
      .catch((err) => {
        console.log(err);  // Log de erros
        msgType = 'error';  // Se houve erro, o tipo da mensagem será 'error'
        return err.response.data;  // Retorna o erro
      });

    // Exibe a mensagem de feedback (sucesso ou erro)
    setFlashMessage(data.message, msgType);
    navigate('/books/mybooks');  // Redireciona para a página com os livros do usuário após sucesso
  }

  return (
    <section>
      <div className={styles.addpet_header}>
        <h1>Register Book:</h1>
        <p>Fill in the details and make it available for adoption!</p>
      </div>
      {/* O formulário do livro */}
      <BookForm handleSubmit={registerBook} btnText="Register Book" />
    </section>
  );
}

export default AddBook;
