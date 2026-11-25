<?php if(boomAllow($addons['addons_access'])){
	require_once(BOOM_PATH . '/addons/backdrops/system/addons_function.php');
	$bd_c = bdCfg($addons);
	$bd_me = isset($data['user_id']) ? (int)$data['user_id'] : 0;
	$bd_rank = isset($data['user_rank']) ? (int)$data['user_rank'] : 0;
	list($bd_style, $bd_look) = bdActive($bd_c, $bd_me, $bd_rank);
	$bd_list = array(); $bd_ranks = bdRanks();
	foreach(bdStyles() as $k => $s){
		if($bd_c['styles'][$k]['on'] !== 1){ continue; }
		$bd_r = $bd_c['styles'][$k]['r'];
		$bd_list[] = array('k' => $k, 'n' => $s[0], 'd' => $s[1], 't' => $s[2], 'ok' => $bd_rank >= $bd_r ? 1 : 0, 'who' => $bd_ranks[$bd_r]);
	}
	$bd_js = array('base' => 'addons/backdrops/', 'style' => $bd_style, 'look' => $bd_look, 'list' => $bd_list, 'busy' => $bd_c['busy'],
		'phone' => $bd_c['phone'], 'place' => $bd_c['place'], 'cr' => $bd_c['credit']);
	$bd_v = @filemtime(__DIR__ . '/backdrops.js') . '-' . @filemtime(__DIR__ . '/backdrops.css');
?>
<script data-cfasync="false">
window.BACKDROP_CFG = <?php echo json_encode($bd_js); ?>;
boomAddCss('addons/backdrops/files/backdrops.css?v=<?php echo $bd_v; ?>');
</script>
<script data-cfasync="false" src="addons/backdrops/files/backdrops.js?v=<?php echo $bd_v; ?>"></script>
<?php } ?>
