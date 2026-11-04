package com.staypass.core.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.staypass.core.theme.BadgeVerifiedText
import com.staypass.core.theme.NeutralGrey
import com.staypass.core.theme.OnPrimaryContainer
import com.staypass.core.theme.PrimaryContainer
import com.staypass.core.theme.StayPassTypography
import com.staypass.core.theme.SurfaceContainerLowest

enum class BedState {
    AVAILABLE,
    SELECTED,
    OCCUPIED,
    UNAVAILABLE
}

enum class BedTier {
    LOWER_BUNK,
    UPPER_BUNK,
    SINGLE_COT
}

@Composable
fun BedItem(
    bedId: String,
    bedCode: String, // e.g. "B1", "Bed A"
    tier: BedTier,
    state: BedState,
    monthlyPrice: Long,
    onBedClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isClickable = state == BedState.AVAILABLE || state == BedState.SELECTED

    val (containerColor, contentColor, borderColor) = when (state) {
        BedState.SELECTED -> Triple(
            PrimaryContainer,
            OnPrimaryContainer,
            PrimaryContainer
        )
        BedState.AVAILABLE -> Triple(
            SurfaceContainerLowest,
            Color(0xFF151C27),
            Color(0xFF246BCE)
        )
        BedState.OCCUPIED -> Triple(
            Color(0xFFF3F4F6),
            NeutralGrey,
            Color(0xFFE5E7EB)
        )
        BedState.UNAVAILABLE -> Triple(
            Color(0xFFF9FAFB),
            NeutralGrey,
            Color(0xFFE5E7EB)
        )
    }

    val tierLabel = when (tier) {
        BedTier.LOWER_BUNK -> "Lower Bunk"
        BedTier.UPPER_BUNK -> "Upper Bunk"
        BedTier.SINGLE_COT -> "Single Cot"
    }

    Card(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(enabled = isClickable, onClick = onBedClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        border = BorderStroke(1.5.dp, borderColor),
        elevation = CardDefaults.cardElevation(defaultElevation = if (state == BedState.SELECTED) 4.dp else 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Bed graphic cot headboard indicator
            Box(
                modifier = Modifier
                    .size(width = 36.dp, height = 4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(if (state == BedState.SELECTED) Color.White.copy(alpha = 0.8f) else Color(0xFFC2C6D5))
            )
            Spacer(modifier = Modifier.height(6.dp))

            // Main Cot Icon
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        if (state == BedState.SELECTED) Color.White.copy(alpha = 0.2f)
                        else if (state == BedState.AVAILABLE) Color(0xFFEBF3FE)
                        else Color(0xFFE5E7EB)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (state) {
                        BedState.SELECTED -> StayIcons.Check
                        BedState.OCCUPIED -> StayIcons.Profile
                        else -> StayIcons.Bed
                    },
                    contentDescription = null,
                    tint = contentColor,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Bed Code
            Text(
                text = bedCode,
                style = StayPassTypography.titleSmall,
                color = contentColor
            )

            // Tier
            Text(
                text = tierLabel,
                style = StayPassTypography.bodySmall,
                color = if (state == BedState.SELECTED) Color.White.copy(alpha = 0.9f) else Color(0xFF555E74)
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Status Badge
            when (state) {
                BedState.SELECTED -> {
                    Text(
                        text = "Selected",
                        style = StayPassTypography.labelSmall,
                        color = Color.White
                    )
                }
                BedState.AVAILABLE -> {
                    Text(
                        text = "₹${monthlyPrice}/mo",
                        style = StayPassTypography.labelSmall,
                        color = BadgeVerifiedText
                    )
                }
                BedState.OCCUPIED -> {
                    Text(
                        text = "Occupied",
                        style = StayPassTypography.labelSmall,
                        color = NeutralGrey
                    )
                }
                BedState.UNAVAILABLE -> {
                    Text(
                        text = "Reserved",
                        style = StayPassTypography.labelSmall,
                        color = NeutralGrey
                    )
                }
            }
        }
    }
}
