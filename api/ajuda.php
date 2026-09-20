<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = '127.0.0.1'; 
$dbname = 'eqz_db'; // Nome do seu banco de dados
$username = 'root';
$password = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Certifique-se de que a tabela existe
    $pdo->exec("CREATE TABLE IF NOT EXISTS relatos_ajuda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        autor VARCHAR(255) NOT NULL,
        texto TEXT NOT NULL,
        resposta TEXT DEFAULT '',
        data_hora VARCHAR(100) NOT NULL,
        data_iso DATE NOT NULL,
        timestamp BIGINT NOT NULL
    )");

    $metodo = $_SERVER['REQUEST_METHOD'];
    $entrada = json_decode(file_get_contents('php://input'), true);

    // TRATAMENTO DE POST (Enviar novo relato)
    if ($metodo === 'POST' && isset($entrada['acao']) && $entrada['acao'] === 'enviar_relato') {
        $autor = trim($entrada['autor'] ?? 'Anônimo');
        $texto = trim($entrada['texto'] ?? '');

        if (empty($texto)) {
            echo json_encode(["erro" => "O texto não pode estar vazio."]);
            exit;
        }

        date_default_timezone_set('America/Sao_Paulo');
        $dataIso = date('Y-m-d');
        $dataHoraFormatada = date('d/m/Y') . ' às ' . date('H:i');
        $timestamp = time() * 1000;

        $stmt = $pdo->prepare("INSERT INTO relatos_ajuda (autor, texto, resposta, data_hora, data_iso, timestamp) VALUES (?, ?, '', ?, ?, ?)");
        $stmt->execute([$autor, $texto, $dataHoraFormatada, $dataIso, $timestamp]);

        echo json_encode(["sucesso" => true, "mensagem" => "Relato enviado com sucesso!"]);
        exit;
    }

    // TRATAMENTO DE GET (Listar relatos agrupados por data para manter compatibilidade com o front)
    $stmt = $pdo->prepare("SELECT * FROM relatos_ajuda ORDER BY id DESC");
    $stmt->execute();
    $relatos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $estruturaAgrupada = [];
    foreach ($relatos as $r) {
        $dataKey = $r['data_iso'];
        if (!isset($estruturaAgrupada[$dataKey])) {
            $estruturaAgrupada[$dataKey] = [
                "relatosAjuda" => []
            ];
        }
        $estruturaAgrupada[$dataKey]["relatosAjuda"][] = [
            "autor" => $r['autor'],
            "texto" => $r['texto'],
            "resposta" => $r['resposta'],
            "dataHora" => $r['data_hora'],
            "timestamp" => (int)$r['timestamp']
        ];
    }

    echo json_encode($estruturaAgrupada);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no banco de dados: " . $e->getMessage()]);
}
?>