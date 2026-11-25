<?php
$load_addons = 'backdrops';
require(__DIR__ . '/../../../system/config_addons.php');
if(!canManageAddons()){ die(); }
$c = bdCfg($addons);
$styles = bdStyles();
$ranks = bdRanks();
$onoff = array(1 => 'On', 0 => 'Off');
/* how many members picked each style */
$used = array();
$uq = $mysqli->query("SELECT style, COUNT(*) AS n FROM backdrops_users GROUP BY style");
if($uq){ while($r = $uq->fetch_assoc()){ $used[$r['style']] = (int)$r['n']; } }
$defs = array('none' => 'No backdrop (members pick one themselves)');
foreach($styles as $k => $s){ $defs[$k] = $s[0]; }
$bd_v = @filemtime(BOOM_PATH . '/addons/backdrops/files/backdrops.js');
echo elementTitle('Backdrops', "loadLob('admin/setting_addons.php');");
?>
<style>
.bda_grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-top:8px}
.bda_card{border:1px solid rgba(128,128,128,.25);border-radius:14px;padding:8px;overflow:hidden}
.bda_prev{position:relative;height:110px;border-radius:10px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;gap:4px}
.bda_prev canvas{display:block;width:100%;height:100%;border-radius:8px}
.bda_top{display:flex;align-items:center;gap:8px;margin-top:8px}
.bda_top b{flex:1;font-size:15px}
.bda_btn{border:0;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;color:#fff}
.bda_btn.on{background:#16a34a}
.bda_btn.off{background:#9ca3af}
.bda_desc{font-size:12px;opacity:.75;margin:4px 0 8px;line-height:1.35}
.bda_used{font-size:11px;opacity:.6;margin-top:6px}
.bda_tag{font-size:10px;font-weight:700;opacity:.6;text-align:center;margin-top:2px;display:grid;grid-template-columns:1fr 1fr}
</style>
<div class="page_full"><div class="page_element"><div class="tpad15">
	<p class="sub_text">Members open <b>Backdrops</b> from the <b>+</b> button next to the chat box or from the <b>Apps</b> menu and pick an animated background for their own chat. You decide which styles are on and which ranks can use each one.</p>

	<p class="label tmargin15"><b>Styles</b></p>
	<p class="sub_text text_xsmall">Each style comes in a light and a dark version (shown left and right). Move your mouse over a preview to try it.</p>
	<div class="bda_grid">
	<?php foreach($styles as $k => $s){ $sc = $c['styles'][$k]; ?>
		<div class="bda_card">
			<div class="bda_prev"><canvas data-k="<?php echo $k; ?>" data-dark="0"></canvas><canvas data-k="<?php echo $k; ?>" data-dark="1"></canvas></div>
			<div class="bda_tag"><span>Light</span><span>Dark</span></div>
			<div class="bda_top"><b><?php echo bdTxt($s[0]); ?></b>
				<button type="button" class="bda_btn <?php echo $sc['on'] ? 'on' : 'off'; ?>" id="bda_on_<?php echo $k; ?>" data-on="<?php echo $sc['on']; ?>" onclick="bdaToggle(this)"><?php echo $sc['on'] ? 'On' : 'Off'; ?></button></div>
			<p class="bda_desc"><?php echo bdTxt($s[1]); ?>. <?php echo bdTxt($s[2]); ?>.</p>
			<p class="label">Who can use it</p>
			<?php echo bdSel('bda_r_' . $k, $sc['r'], $ranks); ?>
			<p class="bda_used"><?php $n = isset($used[$k]) ? $used[$k] : 0; echo $n === 1 ? '1 member uses it' : $n . ' members use it'; ?></p>
		</div>
	<?php } ?>
	</div>

	<p class="label tmargin20"><b>Settings</b></p>
	<div class="setting_element"><p class="label">Backdrop for members who haven't picked one</p>
		<p class="sub_text text_xsmall">Members who can't use this style see the plain chat until they pick one they can use.</p>
		<?php echo bdSel('bda_def', $c['def'], $defs); ?></div>
	<div class="setting_element"><p class="label">Light or dark</p>
		<p class="sub_text text_xsmall">Auto follows the chat theme. Members can still pick their own.</p>
		<?php echo bdSel('bda_look', $c['look'], array(0 => 'Auto (follow the chat theme)', 1 => 'Light', 2 => 'Dark')); ?></div>
	<div class="setting_element"><p class="label">How busy</p>
		<?php echo bdSel('bda_busy', $c['busy'], array(1 => 'Calm (fewer moving parts)', 2 => 'Normal', 3 => 'Lively')); ?></div>
	<div class="setting_element"><p class="label">On phones</p>
		<p class="sub_text text_xsmall">Lighter runs at 30 frames a second with fewer parts, to save battery.</p>
		<?php echo bdSel('bda_phone', $c['phone'], array(0 => 'Full animation', 1 => 'Lighter animation', 2 => 'Still picture (taps still work)')); ?></div>
	<div class="setting_element"><p class="label">Where the button shows</p>
		<?php echo bdSel('bda_place', $c['place'], array(0 => 'Both: the + button and the Apps menu', 1 => 'Only the + button next to the chat box', 2 => 'Only the Apps menu')); ?></div>
	<div class="setting_element"><p class="label">Show credit link</p>
		<p class="sub_text text_xsmall">A small "Backdrops by M Kashif" line with links to GitHub and chatnoregister.com in the picker. Keeping it on supports free add-ons.</p>
		<?php echo bdSel('bda_credit', $c['credit'], $onoff); ?></div>
	<button class="reg_button theme_btn tmargin10" onclick="bdaSave()">Save</button>
	<p class="sub_text text_xsmall tmargin15">Backdrops add-on by <a href="https://github.com/cashifdev" target="_blank">M Kashif</a> · see it live at <a href="https://chatnoregister.com" target="_blank">chatnoregister.com</a></p>
</div></div></div>
<script>
var bdaKeys = <?php echo json_encode(array_keys($styles)); ?>, bdaScenes = [];
function bdaToggle(b){ var on = $(b).attr('data-on') === '1' ? 0 : 1; $(b).attr('data-on', on).toggleClass('on', !!on).toggleClass('off', !on).text(on ? 'On' : 'Off'); }
function bdaSave(){
	var d = { act: 'admin_save', token: typeof utk !== 'undefined' ? utk : '' };
	['def', 'look', 'busy', 'phone', 'place', 'credit'].forEach(function(k){ d[k] = $('#bda_' + k).val(); });
	bdaKeys.forEach(function(k){ d['on_' + k] = $('#bda_on_' + k).attr('data-on'); d['r_' + k] = $('#bda_r_' + k).val(); });
	$.post('addons/backdrops/system/action.php', d, function(r){ callSaved(r && r.ok ? 'Saved. Members see it after a page refresh.' : ((r && r.msg) || 'Not saved'), r && r.ok ? 1 : 3); }, 'json');
}
function bdaPreview(){
	if(!window.Backdrops){ return setTimeout(bdaPreview, 300); }
	bdaScenes.forEach(Backdrops.unmount); bdaScenes = [];
	document.querySelectorAll('.bda_prev canvas').forEach(function(cv){
		bdaScenes.push(Backdrops.mount(cv, { style: cv.getAttribute('data-k'), dark: cv.getAttribute('data-dark') === '1', busy: 2, fps30: true, mini: true }));
	});
}
(function(){
	if(window.Backdrops){ bdaPreview(); return; }
	var s = document.createElement('script'); s.src = 'addons/backdrops/files/backdrops.js?v=<?php echo $bd_v; ?>'; s.onload = bdaPreview; document.body.appendChild(s);
})();
</script>
