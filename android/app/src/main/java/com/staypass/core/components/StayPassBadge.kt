package com.staypass.core.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.staypass.core.theme.BadgeBoysBg
import com.staypass.core.theme.BadgeBoysText
import com.staypass.core.theme.BadgeGirlsBg
import com.staypass.core.theme.BadgeGirlsText
import com.staypass.core.theme.BadgePendingBg
import com.staypass.core.theme.BadgePendingText
import com.staypass.core.theme.BadgeVerifiedBg
import com.staypass.core.theme.BadgeVerifiedText
import com.staypass.core.theme.StayPassTypography

enum class BadgeType {
    VERIFIED,
    PENDING,
    BOYS_ONLY,
    GIRLS_ONLY,
    NEUTRAL
}

@Composable
fun StayPassBadge(
    text: String,
    modifier: Modifier = Modifier,
    type: BadgeType = BadgeType.NEUTRAL,
    icon: ImageVector? = null,
    customTextColor: Color? = null,
    customBgColor: Color? = null
) {
    val (textColor, bgColor) = when {
        customTextColor != null && customBgColor != null -> customTextColor to customBgColor
        type == BadgeType.VERIFIED -> BadgeVerifiedText to BadgeVerifiedBg
        type == BadgeType.PENDING -> BadgePendingText to BadgePendingBg
        type == BadgeType.BOYS_ONLY -> BadgeBoysText to BadgeBoysBg
        type == BadgeType.GIRLS_ONLY -> BadgeGirlsText to BadgeGirlsBg
        else -> Color(0xFF6B7280) to Color(0xFFF3F4F6)
    }

    val finalIcon = icon ?: when (type) {
        BadgeType.VERIFIED -> StayIcons.Verified
        BadgeType.BOYS_ONLY -> StayIcons.Man
        BadgeType.GIRLS_ONLY -> StayIcons.Woman
        BadgeType.PENDING -> StayIcons.Dispute
        BadgeType.NEUTRAL -> null
    }

    Box(
        modifier = modifier
            .background(
                color = bgColor,
                shape = RoundedCornerShape(percent = 50)
            )
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (finalIcon != null) {
                Icon(
                    imageVector = finalIcon,
                    contentDescription = null,
                    tint = textColor,
                    modifier = Modifier.size(13.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
            }
            Text(
                text = text,
                color = textColor,
                style = StayPassTypography.labelSmall
            )
        }
    }
}
