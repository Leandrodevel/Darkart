<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = '127.0.0.1'; 
$dbname = 'eqz_db'; 
$username = 'root';$password = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $metodo = $_SERVER['REQUEST_METHOD'];$entrada = json_decode(file_get_contents('php://input'), true);

    // ==========================================
    // TRATAMENTO DE REQUISIÇÕES POST (Escrita / Ações)
    // ==========================================
    if ($metodo === 'POST') {$acao = isset($entrada['acao']) ?$entrada['acao'] : '';

        if ($acao === 'enviar_mensagem') {
            $texto = trim($entrada['texto'] ?? '');
            $dataIso =$entrada['dataIso'] ?? date('Y-m-d');
            $horario = date('H:i');

            if (empty($texto)) {
                http_response_code(400);
                echo json_encode(["erro" => "O texto da mensagem não pode estar vazio."]);
                exit;
            }

            $stmt =$pdo->prepare("INSERT INTO mensagens_dia (data_iso, horario, texto, reacao_coracao, reacao_amem, reacao_flor) VALUES (?, ?, ?, 0, 0, 0)");
            $stmt->execute([$dataIso, $horario,$texto]);

            echo json_encode(["sucesso" => true, "mensagem" => "Mensagem salva com sucesso!"]);
            exit;
        }

        if ($acao === 'sincronizar_reacoes') {
            $pendencias =$entrada['pendencias'] ?? [];

            foreach ($pendencias as$p) {
                $dataIso =$p['dataIso'];
                $indexMensagem = (int)$p['indexMensagem'];
                $tipoReacao =$p['tipoReacao']; 
                $acaoReacao =$p['acao']; 

                $coluna = "";
                if ($tipoReacao === 'coracao')$coluna = "reacao_coracao";
                elseif ($tipoReacao === 'amem')$coluna = "reacao_amem";
                elseif ($tipoReacao === 'flor')$coluna = "reacao_flor";

                if ($coluna) {
                    $stmtBusca =$pdo->prepare("SELECT id FROM mensagens_dia WHERE data_iso = ? ORDER BY id ASC");
                    $stmtBusca->execute([$dataIso]);
                    $mensagens =$stmtBusca->fetchAll(PDO::FETCH_ASSOC);

                    if (isset($mensagens[$indexMensagem])) {$idMensagem = $mensagens[$indexMensagem]['id'];
                        $operacao = ($acaoReacao === 'adicionar') ? "+ 1" : "- 1";

                        $stmtUpdate =$pdo->prepare("UPDATE mensagens_dia SET $coluna = GREATEST(0, $coluna$operacao) WHERE id = ?");
                        $stmtUpdate->execute([$idMensagem]);
                    }
                }
            }

            echo json_encode(["sucesso" => true, "mensagem" => "Reações sincronizadas com sucesso!"]);
            exit;
        }

        if ($acao === 'salvar_mensagem_autor') {
            $autor =$entrada['autor'] ?? '';
            $data =$entrada['data'] ?? date('Y-m-d');
            $texto =$entrada['texto'] ?? '';

            $pdo->query("TRUNCATE TABLE mensagens_autor");
            $stmt =$pdo->prepare("INSERT INTO mensagens_autor (autor, data, texto) VALUES (?, ?, ?)");
            $stmt->execute([$autor, $data,$texto]);

            echo json_encode(["sucesso" => true, "mensagem" => "Mensagem do autor atualizada!"]);
            exit;
        }

        if ($acao === 'salvar_video_dia') {
            $data =$entrada['data'] ?? date('Y-m-d');
            $titulo =$entrada['titulo'] ?? '';
            $descricao =$entrada['descricao'] ?? '';
            $youtubeId =$entrada['youtube_id'] ?? '';

            $stmt =$pdo->prepare("REPLACE INTO videos_dia (data, titulo, descricao, youtube_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data,$titulo, $descricao,$youtubeId]);

            echo json_encode(["sucesso" => true, "mensagem" => "Vídeo do dia salvo com sucesso!"]);
            exit;
        }

        if ($acao === 'responder_relato') {
            $id =$entrada['id'] ?? null;
            $respostaRelato =$entrada['resposta'] ?? '';

            if ($id) {
                $stmt =$pdo->prepare("UPDATE relatos_ajuda SET resposta = ? WHERE id = ?");
                $stmt->execute([$respostaRelato,$id]);
                echo json_encode(["sucesso" => true, "mensagem" => "Resposta enviada com sucesso!"]);
                exit;
            }
        }
          if ($acao === 'cadastrar_admin') {
            $id = $entrada['id'] ?? '';
            $apelido = $entrada['apelido'] ?? '';
            $senha = $entrada['senha'] ?? '';
            $nivel = $entrada['nivel'] ?? 'Admin';

            if (empty($id) || empty($apelido) || empty($senha)) {
                http_response_code(400);
                echo json_encode(["erro" => "Preencha todos os campos do administrador."]);
                exit;
            }

            try {
                $stmt = $pdo->prepare("INSERT INTO admins (id, apelido, senha, nivel) VALUES (?, ?, ?, ?)");
                $stmt->execute([$id, $apelido, $senha, $nivel]);
                echo json_encode(["sucesso" => true, "mensagem" => "Administrador cadastrado com sucesso!"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao cadastrar (o ID já pode existir): " . $e->getMessage()]);
            }
            exit;
        }

        if ($acao === 'excluir_registro') {
            $tabela =$entrada['tabela'] ?? '';
            $id =$entrada['id'] ?? '';

            $tabelasPermitidas = ['admins', 'mensagens_autor', 'mensagens_dia', 'relatos_ajuda', 'videos_dia'];
            if (in_array($tabela, $tabelasPermitidas) && !empty($id)) {
                $pk = ($tabela === 'videos_dia') ? 'data' : 'id';
                $stmt =$pdo->prepare("DELETE FROM `$tabela` WHERE `$pk` = ?");
                $stmt->execute([$id]);
                echo json_encode(["sucesso" => true, "mensagem" => "Registro excluído com sucesso!"]);
                exit;
            }
        }
    }

  
    // ==========================================
    // TRATAMENTO DE REQUISIÇÕES GET (Leitura)
    // ==========================================
    $recurso = isset($_GET['recurso']) ? $_GET['recurso'] : '';$tabelasPermitidas = ['admins', 'mensagens_autor', 'mensagens_dia', 'relatos_ajuda', 'videos_dia'];

    if (!empty($recurso) && in_array($recurso,$tabelasPermitidas)) {
        $stmt =$pdo->query("SELECT * FROM `$recurso`");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    $stmtAutor =$pdo->prepare("SELECT autor, data, texto FROM mensagens_autor ORDER BY id DESC LIMIT 1");
    $stmtAutor->execute();
    $msgAutor =$stmtAutor->fetch(PDO::FETCH_ASSOC);

    $resposta = [
        "configAdm" => [
            "id" => "203077",
            "apelido" => "Andarilho"
        ],
        "mensagensDoAutor" => $msgAutor ? [
            "autor" => $msgAutor['autor'],
            "data" => $msgAutor['data'],
            "texto" => $msgAutor['texto']
        ] : null
    ];

    $dataHoje = date('Y-m-d');
    
    $stmtVideo =$pdo->prepare("SELECT titulo, descricao, youtube_id FROM videos_dia WHERE data = ?");
    $stmtVideo->execute([$dataHoje]);
    $video =$stmtVideo->fetch(PDO::FETCH_ASSOC);

    $stmtMensagens =$pdo->prepare("SELECT horario, texto, data_iso, reacao_coracao, reacao_amem, reacao_flor FROM mensagens_dia WHERE data_iso = ?");
    $stmtMensagens->execute([$dataHoje]);
    $mensagensDia =$stmtMensagens->fetchAll(PDO::FETCH_ASSOC);

    $mensagensFormatadas = [];
    foreach ($mensagensDia as $m) {$mensagensFormatadas[] = [
            "texto" => $m['texto'],
            "horario" => $m['horario'],
            "dataIso" => $m['data_iso'],
            "reacoes" => [
                "coracao" => (int)$m['reacao_coracao'],
                "amem" => (int)$m['reacao_amem'],
                "flor" => (int)$m['reacao_flor']
            ]
        ];
    }

    $resposta[$dataHoje] = [
        "videoDoDia" => $video ? [
            "titulo" => $video['titulo'],
            "descricao" => $video['descricao'],
            "youtubeId" => $video['youtube_id']
        ] : null,
        "resumoDiario" => [
            "data" => date('d/m/Y')
        ],
        "mensagensDoDia" => $mensagensFormatadas
    ];

    echo json_encode($resposta);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão com o banco: " . $e->getMessage()]);
}
?>