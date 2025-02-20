<?php
/**
 * SlideDeck Editor Form
 *
 * More information on this project:
 * http://www.slidedeck.com/
 *
 * Full Usage Documentation: http://www.slidedeck.com/usage-documentation
 *
 * @package SlideDeck
 * @subpackage SlideDeck 3 Pro for WordPress
 * @author Hummingbird Web Solutions Pvt. Ltd.
 */

/*
Copyright 2012 HBWSL  (email : support@hbwsl.com)

This file is part of SlideDeck.

SlideDeck is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

SlideDeck is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with SlideDeck.  If not, see <http://www.gnu.org/licenses/>.
*/
?>
<?php do_action( "{$namespace}_before_form", $slidedeck, $form_action ); ?>
<div id="slidedeck-scheduler-warning" class="error fade"><p>All slides have future dates set to them and global date is not selected, so the slider frame will show up on the site. Please set global date to hide slider frame in this case.</div>
<div class="wrap" id="slidedeck_form">

    <?php slidedeck_flash(); ?>


    <p>
        <a href="<?php echo slidedeck_action(); ?>" id="back-to-manage"><?php _e( "Back to Manage Screen", $namespace ); ?></a>
        <a class="docs" target="_blank" href="https://docs.slidedeck.com/?utm_source=sd5_documentation&amp;utm_campaign=sd5_lite&amp;utm_medium=link" >Documentation</a>
        <a class="demo" target="_blank" href="https://www.slidedeck.com/slidedeck-types-examples/?utm_source=sd5_demos&amp;utm_campaign=sd5_lite&amp;utm_medium=link" >Demo</a>
    </p>

    <form action="" method="post" id="slidedeck-update-form" class="slidedeck-form">

        <div id="titlediv" class="clearfix">
        	<div id="titlewrap"<?php if( $form_action == 'create' ) echo ' class="editing"'; ?>>
	            <input type="text" name="title" size="30" value="<?php echo $slidedeck['title']; ?>" id="title" class="input-large<?php if( $form_action == 'create' ) echo ' auto-replace empty'; ?>" />
	            <span id="title-display"><span class="title"><?php echo $slidedeck['title']; ?></span> <a href="#edit" class="edit-link">Edit</a></span>
        	</div>

            <?php // echo $this->upgrade_button('edit'); ?>
        </div>

        <fieldset id="slidedeck-section-header" class="slidedeck-form-section slidedeck-header">
            <?php wp_nonce_field( "{$namespace}-{$form_action}-slidedeck" ); ?>
            <input type="hidden" name="action" value="<?php echo $form_action; ?>" id="form_action" />
            <input type="hidden" name="id" value="<?php echo $slidedeck['id']; ?>" id="slidedeck_id" />
            <?php wp_nonce_field( "{$namespace}-preview-iframe-update", "_wpnonce_preview", false ); ?>
            <?php wp_nonce_field( "{$namespace}-lens-update", "_wpnonce_lens_update", false ); ?>
            <?php wp_nonce_field( "{$namespace}-update-options-groups", "_wpnonce_update_options_groups", false ); ?>

            <div id="slidedeck-content-control" class="clearfix <?php echo $slidedeck_is_dynamic ? 'dynamic-slidedeck' : 'custom-slidedeck'; ?>">
	            <?php do_action( "{$namespace}_content_control", $slidedeck, $namespace ); ?>
            </div>
        </fieldset>
        
        <div id="slidedeck-form-body">
            <?php do_action( "{$namespace}_form_top", $slidedeck, $form_action ); ?>
            <fieldset id="slidedeck-section-preview" class="slidedeck-form-section collapsible clearfix">

                <div class="hndl-container">
                    <h3 class="hndl"><span class="indicator"></span><?php _e( "Preview", $namespace ); ?></h3>
                    <?php do_action( "{$namespace}_top_hndl_container" ); ?>
                    <ul id="preview-textures">
                        <?php foreach( $stage_backgrounds as $stage_background => $label ): ?>
        	                <li id="texture-<?php echo $stage_background; ?>"<?php if( $stage_background == $the_stage_background ) echo ' class="active"'; ?>><a href="<?php echo wp_nonce_url( admin_url( 'admin-ajax.php?action=' . $namespace . '_stage_background&slidedeck=' . $slidedeck['id'] . '&background=' . $stage_background ), "{$namespace}-stage-background" ); ?>"><span class="texture"><?php echo $label; ?></span></a></li>
                        <?php endforeach; ?>
                	</ul>
                </div>

                <div class="inner <?php if( !empty( $the_stage_background ) ) echo 'texture-' . $the_stage_background; ?>">

                    <iframe id="slidedeck-preview" frameborder="0" allowtransparency="yes"  src="<?php echo $iframe_url; ?>" style="width:<?php echo $dimensions['outer_width']; ?>px;height:<?php echo $dimensions['outer_height']; ?>px;"></iframe>

                    <div id="slidedeck-slide-dimensions" class="slidedeck-resizing getting-dimensions"><?php _e( "Slide Area Dimensions Will Be", $namespace ); ?>: <span class="width">700x</span><span class="height">500</span><span class="calculating">Calculating...</span></div>

                </div>

            </fieldset>

            <?php do_action( "{$namespace}_before_options_group_wrapper", $slidedeck, $form_action ); ?>

            <fieldset id="slidedeck-section-options" class="slidedeck-form-section collapsible clearfix">

                <div class="hndl-container">
                    <h3 class="hndl"><span class="indicator"></span><?php _e( "Options", $namespace ); ?></h3>
                </div>

                <div class="inner clearfix">
                    <?php include( SLIDEDECK_DIRNAME . '/views/elements/_options.php' ); ?>
                </div>
            </fieldset>

            <?php do_action( "{$namespace}_after_options_group_wrapper", $slidedeck, $form_action ); ?>

            <?php do_action( "{$namespace}_form_bottom", $slidedeck, $form_action ); ?>
            <div class="save-wrapper">
                <input id="save-slidedeck-button" type="submit" class="button button-primary" value="Save SlideDeck" />
            </div>

        </div>
    </form>
</div>

<script type="text/javascript">
    var SlideDeckFonts = <?php echo json_encode( $fonts ); ?>;
    var __hasSavedCovers = <?php echo var_export( $has_saved_covers, true ); ?>;
</script>

<?php if( isset( $_GET['firstsave'] ) ): ?>
    <script type="text/javascript">
        jQuery(document).ready(function(){SlideDeckPlugin.FirstSaveDialog.open(<?php echo $slidedeck['id']; ?>);});
    </script>
<?php endif; ?>


<?php do_action( "{$namespace}_after_form", $slidedeck, $form_action ); ?>