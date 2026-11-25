<?php
/* Backdrops endpoint
 * members: act=save (style, look)
 * admin:   act=admin_save
 * by M Kashif (github.com/cashifdev) · chatnoregister.com */
$load_addons = 'backdrops';
require(__DIR__ . '/../../../system/config_addons.php');
header('Content-Type: application/json');

function bdOut($a){ echo json_encode($a); exit; }
$act = isset($_POST['act']) ? (string)$_POST['act'] : '';
$cfg = bdCfg($addons);

if($act === 'admin_save'){
	if(!canManageAddons()){ bdOut(array('ok' => 0, 'msg' => 'Only staff who manage add-ons can do that.')); }
	$n = function($k, $min, $max, $def){ return isset($_POST[$k]) ? max($min, min($max, (int)$_POST[$k])) : $def; };
	$def = isset($_POST['def']) ? (string)$_POST['def'] : 'aurora';
	if($def !== 'none' && !isset(bdStyles()[$def])){ $def = 'aurora'; }
	$styles = array();
	foreach(bdStyles() as $k => $s){
		$r = isset($_POST['r_' . $k]) ? (int)$_POST['r_' . $k] : 0;
		$styles[$k] = array('on' => !empty($_POST['on_' . $k]) ? 1 : 0, 'r' => isset(bdRanks()[$r]) ? $r : 0);
	}
	$s = array('custom1' => $def, 'custom2' => $n('look', 0, 2, 0), 'custom3' => $n('credit', 0, 1, 1), 'custom4' => $n('busy', 1, 3, 2),
		'custom5' => $n('phone', 0, 2, 1), 'custom6' => $n('place', 0, 2, 0), 'custom10' => json_encode($styles));
	$set = array();
	foreach($s as $k => $v){ $set[] = "$k = '" . $mysqli->real_escape_string((string)$v) . "'"; }
	$mysqli->query("UPDATE boom_addons SET " . implode(', ', $set) . " WHERE addons = 'backdrops'");
	if(function_exists('redisUpdateAddons')){ redisUpdateAddons('backdrops'); }
	bdOut(array('ok' => 1));
}

if($act === 'save'){
	if(!boomAllow($addons['addons_access'])){ bdOut(array('ok' => 0, 'msg' => 'Backdrops are not available for you.')); }
	$me = (int)$data['user_id'];
	$rank = (int)$data['user_rank'];
	$style = isset($_POST['style']) ? preg_replace('/[^a-z]/', '', (string)$_POST['style']) : 'none';
	$look = isset($_POST['look']) ? max(0, min(2, (int)$_POST['look'])) : 0;
	if($style !== 'none'){
		if(!isset(bdStyles()[$style]) || $cfg['styles'][$style]['on'] !== 1){ bdOut(array('ok' => 0, 'msg' => 'That backdrop is switched off.')); }
		if(!bdCan($cfg, $style, $rank)){ bdOut(array('ok' => 0, 'msg' => bdRanks()[$cfg['styles'][$style]['r']] . ' can use ' . bdStyles()[$style][0] . '.')); }
	}
	$t = time();
	$mysqli->query("INSERT INTO backdrops_users (user_id, style, look, updated) VALUES ('$me', '$style', '$look', '$t') ON DUPLICATE KEY UPDATE style = '$style', look = '$look', updated = '$t'");
	bdOut(array('ok' => 1, 'style' => $style, 'look' => $look));
}
bdOut(array('ok' => 0, 'msg' => 'Bad request'));
?>
