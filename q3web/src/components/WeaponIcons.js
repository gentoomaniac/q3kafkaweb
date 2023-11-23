const WeaponIcons = {
  'MOD_GAUNTLET': 'img/iconw_gauntlet_32.png',
  'MOD_MACHINEGUN': 'img/iconw_machinegun_32.png',
  'MOD_SHOTGUN': 'img/iconw_shotgun_32.png',
  'MOD_GRENADE': 'img/iconw_grenade_32.png',
  'MOD_LIGHTNING': 'img/iconw_lightning_32.png',
  'MOD_PLASMA': 'img/iconw_plasma_32.png',
  'MOD_PLASMA_SPLASH': 'img/iconw_plasma_32.png',
  'MOD_RAILGUN': 'img/iconw_railgun_32.png',
  'MOD_ROCKET': 'img/iconw_rocket_32.png',
  'MOD_ROCKET_SPLASH': 'img/iconw_rocket_32.png',
  'MOD_BFG': 'img/iconw_bfg_32.png',
  'MOD_TRIGGER_HURT': 'img/world_kill_32.png',
  'MOD_FALLING': 'img/world_kill_32.png',
  'MOD_TELEFRAG': 'img/teleporter_32.png',
  'NO_ICON': 'img/no_icon_32.png'
}
const GetWeaponIcon = (key) => {
  return key in WeaponIcons ? WeaponIcons[key] : WeaponIcons['NO_ICON'];
}

export default GetWeaponIcon;
