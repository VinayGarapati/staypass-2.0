package com.staypass.core.components

import androidx.compose.foundation.layout.RowScope
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.staypass.core.theme.OnSurface
import com.staypass.core.theme.StayPassTypography
import com.staypass.core.theme.SurfaceBackground

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StayPassTopAppBar(
    title: String,
    modifier: Modifier = Modifier,
    onBackClick: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
    backgroundColor: Color = SurfaceBackground
) {
    TopAppBar(
        title = {
            Text(
                text = title,
                style = StayPassTypography.titleMedium,
                color = OnSurface
            )
        },
        modifier = modifier,
        navigationIcon = {
            if (onBackClick != null) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = StayIcons.Back,
                        contentDescription = "Back",
                        tint = OnSurface
                    )
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = backgroundColor,
            titleContentColor = OnSurface
        )
    )
}
