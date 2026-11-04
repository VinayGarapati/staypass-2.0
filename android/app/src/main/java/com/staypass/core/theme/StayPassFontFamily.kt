package com.staypass.core.theme

import androidx.compose.ui.text.font.FontFamily

/**
 * StayPass font family definition.
 * Uses FontFamily.SansSerif as standard system font.
 * 
 * To switch to custom Inter font:
 * 1. Download Inter-Regular.ttf, Inter-Medium.ttf, Inter-SemiBold.ttf, Inter-Bold.ttf
 * 2. Place in app/src/main/res/font/
 * 3. Replace FontFamily.SansSerif with:
 *    FontFamily(
 *        Font(R.font.inter_regular, FontWeight.Normal),
 *        Font(R.font.inter_medium, FontWeight.Medium),
 *        Font(R.font.inter_semibold, FontWeight.SemiBold),
 *        Font(R.font.inter_bold, FontWeight.Bold)
 *    )
 */
val StayPassFontFamily: FontFamily = FontFamily.SansSerif
