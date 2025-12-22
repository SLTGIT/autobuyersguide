<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'autobuyers' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'Bx|6j#^<JK;v<;*8cmEtd<^M-5K0A!,4qDo(@U2yes XUPmq^3GDgR_7(XSJgGN|' );
define( 'SECURE_AUTH_KEY',  '&]S9QdE|$[2112o4pR)*=rL>FL|L!7A~2Iqx+@:SMVmH}/<B;RksAs#}y{48@.p6' );
define( 'LOGGED_IN_KEY',    'F}gUT +L$=c0:;q)mme<AOqD{%{l.%3ty%,V>fbgj%s?vO:3+{R)??hl:8~RxS/T' );
define( 'NONCE_KEY',        'CdluKWdKb17:1ITmw0OXiHEZXnw|vc1Ats2:mir5Odii|o3esFXm6`q~LH%cv}9T' );
define( 'AUTH_SALT',        ']8U-pOGc/iYi%F9ZA<3%];y|{-R;m[MgjwdGNL/*og:B2Ezi,b<1[V,AH}Xt@aeF' );
define( 'SECURE_AUTH_SALT', '{-~z7P$Y3;pD4Qu(2z/k2C+`6/vV.:=o~&oEWA wPOHk>d9_F~ts8yD_?bd2>:KR' );
define( 'LOGGED_IN_SALT',   '1X,M2V07|*(7S 42M<G9N-{6:mx!%I0>;B}fa(L<#?9#+v(b)FMkRJ^gU7^wgCYB' );
define( 'NONCE_SALT',       '=Q6`3*1$K,b0U|A*n>`53Sjoh:]O%*L&#Jq]ZR=}-`(.ln^]`Kd1i1%^YwmuKZYM' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
