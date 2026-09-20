-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 20/09/2026 às 16:45
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `eqz_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `admins`
--

CREATE TABLE `admins` (
  `id` varchar(50) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `apelido` varchar(100) NOT NULL,
  `nivel` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `admins`
--

INSERT INTO `admins` (`id`, `senha`, `apelido`, `nivel`) VALUES
('171095', '171095', 'karina', 'Admin'),
('203077', '203077', 'Mensageiro', 'SEO');

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensagens_autor`
--

CREATE TABLE `mensagens_autor` (
  `id` int(11) NOT NULL,
  `autor` varchar(100) NOT NULL,
  `data` date NOT NULL,
  `texto` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `mensagens_autor`
--

INSERT INTO `mensagens_autor` (`id`, `autor`, `data`, `texto`) VALUES
(1, 'Mensageiro', '2026-09-20', 'Que a paz invada o seu lar neste domingo. Acredite na sua força interior! ✨ amem');

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensagens_dia`
--

CREATE TABLE `mensagens_dia` (
  `id` int(11) NOT NULL,
  `data_iso` date NOT NULL,
  `horario` varchar(10) NOT NULL,
  `texto` text NOT NULL,
  `reacao_coracao` int(11) DEFAULT 0,
  `reacao_amem` int(11) DEFAULT 0,
  `reacao_flor` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `mensagens_dia`
--

INSERT INTO `mensagens_dia` (`id`, `data_iso`, `horario`, `texto`, `reacao_coracao`, `reacao_amem`, `reacao_flor`) VALUES
(1, '2026-09-20', '07:15', 'Bom dia a todos! Acordei com uma sensação muito boa hoje.', 2, 2, 0),
(2, '2026-09-20', '08:30', 'Obrigado pelas palavras do Mensageiro, me deram muita direção.', 1, 4, 1),
(3, '2026-09-20', '09:42', 'Alguém mais com dificuldade de focar nas tarefas da semana?', 0, 1, 2),
(4, '2026-09-20', '15:55', 'bom dia a todos', 0, 1, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `relatos_ajuda`
--

CREATE TABLE `relatos_ajuda` (
  `id` int(11) NOT NULL,
  `data_iso` date NOT NULL,
  `autor` varchar(100) NOT NULL,
  `texto` text NOT NULL,
  `resposta` text DEFAULT NULL,
  `data_hora` varchar(50) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `relatos_ajuda`
--

INSERT INTO `relatos_ajuda` (`id`, `data_iso`, `autor`, `texto`, `resposta`, `data_hora`, `timestamp`) VALUES
(1, '2026-09-20', 'Sofia', 'Estava me sentindo muito sozinha, mas ler o site tem me ajudado a ver as coisas de outra forma.', 'acalm', '20/09/2026 às 10:10', 1789902600000),
(2, '2026-09-20', 'solitario', 'preciso de ajuda para ansiedade', 'fique em paz', '20/09/2026 às 10:17', 1789910270000);

-- --------------------------------------------------------

--
-- Estrutura para tabela `videos_dia`
--

CREATE TABLE `videos_dia` (
  `data` date NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `youtube_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `videos_dia`
--

INSERT INTO `videos_dia` (`data`, `titulo`, `descricao`, `youtube_id`) VALUES
('2026-09-19', '5 Vícios Que Mudam Sua Vida FINANCEIRA | Napoleon Hill', 'Sua vida financeira não muda apenas quando entra mais dinheiro. Ela começa a mudar quando você transforma os hábitos que repete todos os dias. Neste vídeo, você vai conhecer 5 vícios de prosperidade que podem fortalecer sua fé, sua disciplina, sua relação com o dinheiro e sua preparação para crescer com mais sabedoria.', 'ktyytRNqQRA'),
('2026-09-20', 'Mude sua vibração agora', 'Neste vídeo Mabel Cristina fala sobre como mudar sua vibração e pensamentos', 'Nq2HMAeH36U');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `mensagens_autor`
--
ALTER TABLE `mensagens_autor`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `mensagens_dia`
--
ALTER TABLE `mensagens_dia`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `relatos_ajuda`
--
ALTER TABLE `relatos_ajuda`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `videos_dia`
--
ALTER TABLE `videos_dia`
  ADD PRIMARY KEY (`data`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `mensagens_autor`
--
ALTER TABLE `mensagens_autor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `mensagens_dia`
--
ALTER TABLE `mensagens_dia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `relatos_ajuda`
--
ALTER TABLE `relatos_ajuda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
