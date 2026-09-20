<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
// ... restante do código

$host = '127.0.0.1'; 
$dbname = 'eqz_db'; // Ajustado para o nome correto do seu banco criado
$username = 'root';
$password = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $metodo = $_SERVER['REQUEST_METHOD'];
    $entrada = json_decode(file_get_contents('php://input'), true);

    // ==========================================
    // TRATAMENTO DE REQUISIÇÕES POST (Escrita)
    // ==========================================
    if ($metodo === 'POST') {
        $acao = isset($entrada['acao']) ? $entrada['acao'] : '';

        // 1. Enviar nova mensagem do usuário para o mural
        if ($acao === 'enviar_mensagem') {
            $texto = trim($entrada['texto'] ?? '');
            $dataIso = $entrada['dataIso'] ?? date('Y-m-d');
            $horario = date('H:i');

            if (empty($texto)) {
                http_response_code(400);
                echo json_encode(["erro" => "O texto da mensagem não pode estar vazio."]);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO mensagens_dia (data_iso, horario, texto, reacao_coracao, reacao_amem, reacao_flor) VALUES (?, ?, ?, 0, 0, 0)");
            $stmt->execute([$dataIso, $horario, $texto]);

            echo json_encode(["sucesso" => true, "mensagem" => "Mensagem salva com sucesso!"]);
            exit;
        }

        // 2. Sincronizar reações pendentes
        if ($acao === 'sincronizar_reacoes') {
            $pendencias = $entrada['pendencias'] ?? [];

            foreach ($pendencias as $p) {
                $dataIso = $p['dataIso'];
                $indexMensagem = (int)$p['indexMensagem'];
                $tipoReacao = $p['tipoReacao']; // 'coracao', 'amem', 'flor'
                $acaoReacao = $p['acao']; // 'adicionar' ou 'remover'

                // Mapeia o tipo de reação para a coluna correta no banco
                $coluna = "";
                if ($tipoReacao === 'coracao') $coluna = "reacao_coracao";
                elseif ($tipoReacao === 'amem') $coluna = "reacao_amem";
                elseif ($tipoReacao === 'flor') $coluna = "reacao_flor";

                if ($coluna) {
                    // Busca todas as mensagens do dia ordenadas para achar o ID correto pelo índice enviado do front-end
                    $stmtBusca = $pdo->prepare("SELECT id FROM mensagens_dia WHERE data_iso = ? ORDER BY id ASC");
                    $stmtBusca->execute([$dataIso]);
                    $mensagens = $stmtBusca->fetchAll(PDO::FETCH_ASSOC);

                    if (isset($mensagens[$indexMensagem])) {
                        $idMensagem = $mensagens[$indexMensagem]['id'];
                        $operacao = ($acaoReacao === 'adicionar') ? "+ 1" : "- 1";

                        $stmtUpdate = $pdo->prepare("UPDATE mensagens_dia SET $coluna = GREATEST(0, $coluna $operacao) WHERE id = ?");
                        $stmtUpdate->execute([$idMensagem]);
                    }
                }
            }

            echo json_encode(["sucesso" => true, "mensagem" => "Reações sincronizadas com sucesso!"]);
            exit;
        }
    }

    // ==========================================
    // TRATAMENTO DE REQUISIÇÕES GET (Leitura)
    // ==========================================
    // 1. Busca mensagem do autor
    $stmtAutor = $pdo->prepare("SELECT autor, data, texto FROM mensagens_autor ORDER BY data DESC LIMIT 1");
    $stmtAutor->execute();
    $msgAutor = $stmtAutor->fetch(PDO::FETCH_ASSOC);

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
    
    // Busca vídeo do dia
    $stmtVideo = $pdo->prepare("SELECT titulo, descricao, youtube_id FROM videos_dia WHERE data = ?");
    $stmtVideo->execute([$dataHoje]);
    $video = $stmtVideo->fetch(PDO::FETCH_ASSOC);

    // Busca mensagens do dia
    $stmtMensagens = $pdo->prepare("SELECT horario, texto, data_iso, reacao_coracao, reacao_amem, reacao_flor FROM mensagens_dia WHERE data_iso = ?");
    $stmtMensagens->execute([$dataHoje]);
    $mensagensDia = $stmtMensagens->fetchAll(PDO::FETCH_ASSOC);

    $mensagensFormatadas = [];
    foreach ($mensagensDia as $m) {
        $mensagensFormatadas[] = [
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