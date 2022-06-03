from flask import session
import pandas as pd

from helpers.helper import get_preview_df
from .filters import FILTERS
from .orders import ORDERS
from typing import Tuple, Callable
from helpers.helper import save_preview_df, get_df, save_df


# ====================
def generate_source_dups() -> list:

    df = get_df()
    duplicated = df[df.duplicated(subset=['source'])]
    source_dups = duplicated['source'].unique()
    session['start_source_next'] = 0
    session['source_dups'] = source_dups
    return source_dups


# ====================
def get_next_source_dup() -> Tuple[pd.DataFrame, int, int]:

    df = get_df()
    source_dups = session['source_dups']
    num_sources = len(source_dups)
    print(num_sources)
    print(session['start_source_next'])
    if session['start_source_next'] >= num_sources:
        source_dups = generate_source_dups()
        num_sources = len(source_dups)
        if num_sources == 0:
            return pd.DataFrame(), 0, 0
    print(num_sources)
    print(session['start_source_next'])
    source_num = session['start_source_next']
    this_source = source_dups[source_num]
    this_source_dup = df[df['source'] == this_source]
    session['start_source_next'] += 1
    this_source_dup['index'] = this_source_dup.index
    return this_source_dup, source_num, num_sources


# ====================
def update_df(rows_to_drop: list, rows_to_update: dict):

    df = get_df()

    # Remove rows
    df = df.drop(rows_to_drop, axis=0)

    # Update rows
    for index, content in rows_to_update.items():
        index = int(index)
        source, target = content
        assert index in df.index
        df.loc[index]['source'] = source
        df.loc[index]['target'] = target
    save_df(df)

    return len(df)
