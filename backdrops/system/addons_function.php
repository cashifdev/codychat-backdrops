<?php
if(!defined('BOOM')){ die(); }
/* Backdrops for Codychat, by M Kashif (github.com/cashifdev) · chatnoregister.com */

/* the styles: key => [name, what it looks like, what your finger or mouse does] */
function bdStyles(){
	return array(
		'aurora'  => array('Aurora', 'Soft northern lights drifting slowly', 'The colours follow your mouse or finger'),
		'stars'   => array('Constellation', 'Stars that link up into shapes', 'Stars reach out to your pointer; tap for a shockwave'),
		'bubbles' => array('Bubbles', 'Bubbles floating up', 'Push bubbles around; tap to pop them'),
		'waves'   => array('Ocean Waves', 'Layered waves rolling along the bottom', 'Waves swell under your pointer; tap for a ripple'),
	);
}
/* who can be picked in "Who can use it"; 999 is used internally for "nobody" */
function bdRanks(){
	$t = function($r, $d){ return function_exists('rankTitle') ? rankTitle($r) : $d; };
	return array(
		0   => 'Everyone (guests too)',
		1   => $t(1, 'Members') . ' and up',
		50  => $t(50, 'VIP') . ' and up',
		70  => $t(70, 'Moderators') . ' and up',
		80  => $t(80, 'Admins') . ' and up',
		90  => $t(90, 'Super admins') . ' and up',
		100 => $t(100, 'Owner') . ' only',
	);
}
function bdCfg($a){
	$v = function($k, $d) use ($a){ return (isset($a[$k]) && $a[$k] !== '' && $a[$k] !== null) ? (int)$a[$k] : $d; };
	$def = isset($a['custom1']) ? (string)$a['custom1'] : 'aurora';
	if($def !== 'none' && !isset(bdStyles()[$def])){ $def = 'aurora'; }
	return array(
		'def'    => $def,
		'look'   => min(2, max(0, $v('custom2', 0))),
		'credit' => $v('custom3', 1) === 1 ? 1 : 0,
		'busy'   => min(3, max(1, $v('custom4', 2))),
		'phone'  => min(2, max(0, $v('custom5', 1))),
		'place'  => min(2, max(0, $v('custom6', 0))),
		'styles' => bdStyleCfg(isset($a['custom10']) ? $a['custom10'] : ''),
	);
}
/* on/off and minimum rank for every style */
function bdStyleCfg($json){
	$j = json_decode((string)$json, true);
	$out = array();
	foreach(bdStyles() as $k => $s){
		$on = isset($j[$k]['on']) ? ((int)$j[$k]['on'] === 1 ? 1 : 0) : 1;
		$r  = isset($j[$k]['r']) ? (int)$j[$k]['r'] : 0;
		if(!isset(bdRanks()[$r])){ $r = 0; }
		$out[$k] = array('on' => $on, 'r' => $r);
	}
	return $out;
}
function bdCan($cfg, $k, $rank){
	return isset($cfg['styles'][$k]) && $cfg['styles'][$k]['on'] === 1 && (int)$rank >= $cfg['styles'][$k]['r'];
}
/* the member's saved choice, or null */
function bdChoice($uid){
	global $mysqli;
	$q = $mysqli->query("SELECT style, look FROM backdrops_users WHERE user_id = '" . (int)$uid . "' LIMIT 1");
	return ($q && $q->num_rows) ? $q->fetch_assoc() : null;
}
/* what this member actually sees: their own pick when they may use it, else the site default when they may use that */
function bdActive($cfg, $uid, $rank){
	$c = $uid ? bdChoice($uid) : null;
	$look = $c ? min(2, max(0, (int)$c['look'])) : $cfg['look'];
	$style = $c ? (string)$c['style'] : $cfg['def'];
	if($style === 'none'){ return array('none', $look, $c ? 1 : 0); }
	if(!bdCan($cfg, $style, $rank)){ $style = ($cfg['def'] !== 'none' && bdCan($cfg, $cfg['def'], $rank)) ? $cfg['def'] : 'none'; }
	return array($style, $look, $c ? 1 : 0);
}
function bdTxt($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function bdSel($id, $v, $opts){
	$h = '<select id="' . $id . '" class="full_input">';
	foreach($opts as $k => $label){ $h .= '<option value="' . bdTxt($k) . '"' . ((string)$v === (string)$k ? ' selected' : '') . '>' . bdTxt($label) . '</option>'; }
	return $h . '</select>';
}
?>
