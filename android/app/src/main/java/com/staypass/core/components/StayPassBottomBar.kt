package com.staypass.core.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.staypass.core.theme.BadgeBoysBg
import com.staypass.core.theme.PrimaryContainer
import com.staypass.core.theme.StayPassTypography
import com.staypass.core.theme.SurfaceContainerLowest

enum class NavigationTab(val route: String, val title: String, val icon: ImageVector) {
    HOME("home", "Home", StayIcons.Home),
    EXPLORE("search_results", "Explore", StayIcons.Explore),
    BOOKINGS("my_bookings", "Bookings", StayIcons.Bed),
    SAVED("saved", "Saved", StayIcons.BookmarkBorder),
    PROFILE("profile", "Profile", StayIcons.Profile)
}

@Composable
fun StayPassBottomBar(
    currentRoute: String,
    onTabSelected: (NavigationTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SurfaceContainerLowest)
            .navigationBarsPadding()
    ) {
        HorizontalDivider(
            thickness = 1.dp,
            color = Color(0x0F172033)
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavigationTab.values().forEach { tab ->
                val isSelected = currentRoute == tab.route

                val interactionSource = remember { MutableInteractionSource() }

                Box(
                    modifier = Modifier
                        .clickable(
                            interactionSource = interactionSource,
                            indication = null,
                            onClick = { onTabSelected(tab) }
                        )
                        .background(
                            color = if (isSelected) BadgeBoysBg else Color.Transparent,
                            shape = RoundedCornerShape(20.dp)
                        )
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = tab.icon,
                            contentDescription = tab.title,
                            tint = if (isSelected) PrimaryContainer else Color(0xFF555E74),
                            modifier = Modifier.size(22.dp)
                        )
                        Text(
                            text = tab.title,
                            style = StayPassTypography.labelSmall.copy(
                                fontSize = 10.sp,
                                color = if (isSelected) PrimaryContainer else Color(0xFF555E74)
                            )
                        )
                    }
                }
            }
        }
    }
}
