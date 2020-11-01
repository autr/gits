<script>
import Router from 'svelte-hash-router'
import Sidebar from './components/Sidebar.svelte'
import { onMount } from 'svelte';
import { db } from './store-db.js'


onMount(async () => {
  db.load();
});

</script>


{#if $db.state > 0}
	<Sidebar /> 
  	<div class="router"><Router /></div>
{/if}



<style global lang="sass" >
@import '../../sassis/sassis.sass'
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@200;300;400;500;600;700;800;900&display=swap');

@function color($hue)
	@return hsl($hue,95%,70%)

$fontsize: 12px
$bg: mono(10%)
$bg-light: mono(20%)
$text: mono(80%)
$bright: mono(95%) 
$fade: mono(50%) 
$green: color(100)
$blue: color(200)
$yellow: color(50)
$red: color(340)
$bg-alt: mono(12%)

html
	+sassis( Inconsolata, $fontsize )
	$sidebar: 200px
	.sidebar
		+bg($bg-alt)
		+fixed
		+width-height($sidebar, 100vh)
		border-right: 1px solid mono(15%)
	.router
		+fixed
		+top-left(0px, $sidebar)
		+width-height( calc(100% - #{$sidebar}), 100vh)
		overflow: auto
		padding: 1em
	body
		+bg( mono(10%) )
		color: mono(80%)
		.success, .selected, .added, .new, .created
			color: $green
			border-color: $green
		.info, .ok, .placid
			color: $blue
			border-color: $blue
		.error, .unselected, .removed, .deleted
			color: $red
			border-color: $red
		.alert, .warning
			color: $yellow
			border-color: $yellow
		.strong, .highlight
			color: $bright
			border-color: $bright
			// font-weight: bold
		.fade, .disabled, .unimportant
			color: $fade
			border-color: $fade
		h1, h2, h3, h4, h5, h6
			color: $bright
			font-size: $fontsize
			line-height: $fontsize
			// &:before
			// 	content: "------------------------"
			// 	display: block
			// &:after
			// 	content: "------------------------"
			// 	display: block
		.checkbox
			$s: $fontsize * 0.9
			$c: $fade
			+inline-block
			+width-height($s * 1.5, $s * 1.5)
			+relative
			+top(3px)
			line-height: 0
			input[type=checkbox]
				opacity: 0
				padding: 0
				margin: 0
				z-index: 9
				+fill
			input[type=checkbox] + span
				+width-height($s, $s)
				+absolute
				+top-left(50%, 0%)
				+translate(0%, -50%)
				border: 1px solid $c
				overflow: hidden

			// checked 

			input[type=checkbox]:checked + span
				border-color: $text
				&:before, &:after
					border: 1px solid $text
					content: ""
					+absolute
					+wh($s * 2, $s * 2)
				&:before
					+top-right
					+origin(100%,0%)
					+rotate(-45deg)
				&:after
					+top-left
					+origin(0%,0%)
					+rotate(45deg)

			// indeterminate

			input[type=checkbox]:indeterminate + span
				border-color: $text
				&:before, &:after
					content: ""
					+fill
					border-top: 1px solid $text
					+top(50%)
					margin-top: -0.5px

		button
			background: transparent
			border: 1px solid $text
			color: $text
			text-transform: lowercase
		.chevron
			padding-right: $fontsize
		.select, .chevron
			+inline-block
			+relative
			select
				padding-right: $fontsize
			&:after
				content: ""
				display: inline-block
				+top-right(6px, 2px)
				+absolute
				$s: 4px
				+width-height($s, $s)
				border-left: 1px solid $bright
				border-bottom: 1px solid $bright
				transform: rotateZ(-45deg)
				transform-origin: 50% 50%
		a, select
			cursor: pointer
			display: inline-block
			text-decoration: none
			color: $bright
			border: none
			border-bottom: 1px solid $bright
			background: transparent
			padding: 0
			margin-right: -0.2em
			&.nounderline
				border-bottom-color: transparent
			option
				width: 10px
				display: block
			&:hover
				background: $bg-light
			&:active, &.filled
				background: $bright
				color: $bg
			&.filled
				padding: 0 0.2em

</style>