<?php
if(!defined('BOOM')){ die(); }
/* custom1 = default style for members who never picked one ('none' = no backdrop),
 * custom2 = default look (0 auto, 1 light, 2 dark), custom3 = credit line,
 * custom4 = how busy (1 calm, 2 normal, 3 lively), custom5 = on phones (0 full, 1 lighter, 2 still picture),
 * custom6 = button place (0 both, 1 input + menu, 2 Apps menu), custom10 = styles (on/off + rank) as JSON */
$ad = array('name' => 'backdrops', 'access' => 0, 'custom1' => 'aurora', 'custom2' => '0', 'custom3' => '1', 'custom4' => '2', 'custom5' => '1', 'custom6' => '0',
	'custom10' => '{"aurora":{"on":1,"r":0},"stars":{"on":1,"r":0},"bubbles":{"on":1,"r":1},"waves":{"on":1,"r":50}}');
$mysqli->query("CREATE TABLE IF NOT EXISTS `backdrops_users` (
	`user_id` INT(11) NOT NULL,
	`style` VARCHAR(20) NOT NULL DEFAULT '',
	`look` TINYINT(1) NOT NULL DEFAULT 0,
	`updated` INT(11) NOT NULL DEFAULT 0,
	PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
?>
